import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Sticker, Category, Keychain } from '../data/stickers';
import { DEFAULT_STICKERS, DEFAULT_CATEGORIES } from '../data/stickers';

// ── Banner ─────────────────────────────────────────────────────────────────────
export interface BannerSettings {
  title: string;
  titleHighlight: string;
  emoji: string;
  subtitle: string;
  tags: string[];
  backgroundImage?: string;
}

export const DEFAULT_BANNER: BannerSettings = {
  title: 'Welcome to',
  titleHighlight: 'Derpy Derps',
  emoji: '🦆',
  subtitle: 'The cutest, goofiest, and most adorable stickers on the internet!',
  tags: ['✨ Hand-drawn designs', '🚀 Fast shipping', '💕 Made with love'],
};

const BANNER_KEY = 'banner';

// ── Cache helpers ──────────────────────────────────────────────────────────────
const CACHE_KEY_STICKERS   = 'dd_cache_stickers';
const CACHE_KEY_CATEGORIES = 'dd_cache_categories';
const CACHE_KEY_KEYCHAINS  = 'dd_cache_keychains';
const CACHE_KEY_BANNER     = 'dd_cache_banner';

function readCache<T>(key: string): T[] {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : []; }
  catch { return []; }
}
function readCacheObj<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function writeCache(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ── Context shape ──────────────────────────────────────────────────────────────
interface DataCtx {
  stickers: Sticker[];
  categories: Category[];
  keychains: Keychain[];
  banner: BannerSettings;
  loading: boolean;
  upsertSticker: (data: Omit<Sticker, 'id'> & { id?: string }) => Promise<void>;
  deleteSticker: (id: string) => Promise<void>;
  upsertCategory: (data: Omit<Category, 'id'> & { id?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  upsertKeychain: (data: Omit<Keychain, 'id'> & { id?: string }) => Promise<void>;
  deleteKeychain: (id: string) => Promise<void>;
  saveBanner: (b: BannerSettings) => Promise<void>;
  resetDefaults: () => Promise<void>;
}

const DataContext = createContext<DataCtx | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: React.ReactNode }) {
  const cachedStickers   = readCache<Sticker>(CACHE_KEY_STICKERS);
  const cachedCategories = readCache<Category>(CACHE_KEY_CATEGORIES);
  const cachedKeychains  = readCache<Keychain>(CACHE_KEY_KEYCHAINS);
  const cachedBanner     = readCacheObj<BannerSettings>(CACHE_KEY_BANNER, DEFAULT_BANNER);

  const [stickers,   setStickers]   = useState<Sticker[]>(cachedStickers);
  const [categories, setCategories] = useState<Category[]>(cachedCategories);
  const [keychains,  setKeychains]  = useState<Keychain[]>(cachedKeychains);
  const [banner,     setBanner]     = useState<BannerSettings>(cachedBanner);
  const [loading, setLoading] = useState(cachedStickers.length === 0 && cachedCategories.length === 0);

  // ── Initial fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: stks }, { data: kcs }, { data: settings }] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('stickers').select('*'),
        supabase.from('keychains').select('*'),
        supabase.from('settings').select('*').eq('key', BANNER_KEY).maybeSingle(),
      ]);

      // Seed stickers/categories if first-ever load
      if (!cats || cats.length === 0) {
        await supabase.from('categories').insert(DEFAULT_CATEGORIES);
        await supabase.from('stickers').insert(
          DEFAULT_STICKERS.map(s => ({ ...s, images: s.images ?? [] }))
        );
        setCategories(DEFAULT_CATEGORIES);
        setStickers(DEFAULT_STICKERS);
        writeCache(CACHE_KEY_CATEGORIES, DEFAULT_CATEGORIES);
        writeCache(CACHE_KEY_STICKERS, DEFAULT_STICKERS);
      } else {
        const freshCats = cats as Category[];
        const freshStks = (stks ?? []) as Sticker[];
        setCategories(freshCats);
        setStickers(freshStks);
        writeCache(CACHE_KEY_CATEGORIES, freshCats);
        writeCache(CACHE_KEY_STICKERS, freshStks);
      }

      // Keychains (independent of seed)
      const freshKcs = (kcs ?? []) as Keychain[];
      setKeychains(freshKcs);
      writeCache(CACHE_KEY_KEYCHAINS, freshKcs);

      // Load banner settings
      if (settings?.value) {
        const b = settings.value as BannerSettings;
        setBanner(b);
        writeCache(CACHE_KEY_BANNER, b);
      }

      setLoading(false);
    }
    load();
  }, []);

  // ── Real-time subscriptions ───────────────────────────────────────────────────
  useEffect(() => {
    const stickersCh = supabase
      .channel('stickers-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stickers' }, ({ eventType, new: n, old: o }) => {
        setStickers(prev => {
          const next = eventType === 'DELETE'
            ? prev.filter(s => s.id !== (o as Sticker).id)
            : [...prev.filter(s => s.id !== (n as Sticker).id), n as Sticker];
          writeCache(CACHE_KEY_STICKERS, next);
          return next;
        });
      })
      .subscribe();

    const categoriesCh = supabase
      .channel('categories-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, ({ eventType, new: n, old: o }) => {
        setCategories(prev => {
          const next = eventType === 'DELETE'
            ? prev.filter(c => c.id !== (o as Category).id)
            : [...prev.filter(c => c.id !== (n as Category).id), n as Category];
          writeCache(CACHE_KEY_CATEGORIES, next);
          return next;
        });
      })
      .subscribe();

    const keychainsCh = supabase
      .channel('keychains-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'keychains' }, ({ eventType, new: n, old: o }) => {
        setKeychains(prev => {
          const next = eventType === 'DELETE'
            ? prev.filter(k => k.id !== (o as Keychain).id)
            : [...prev.filter(k => k.id !== (n as Keychain).id), n as Keychain];
          writeCache(CACHE_KEY_KEYCHAINS, next);
          return next;
        });
      })
      .subscribe();

    const settingsCh = supabase
      .channel('settings-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, ({ new: n }) => {
        const row = n as { key: string; value: BannerSettings };
        if (row?.key === BANNER_KEY) {
          setBanner(row.value);
          writeCache(CACHE_KEY_BANNER, row.value);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(stickersCh);
      supabase.removeChannel(categoriesCh);
      supabase.removeChannel(keychainsCh);
      supabase.removeChannel(settingsCh);
    };
  }, []);

  // ── CRUD (optimistic: update local state immediately, real-time handles other devices) ──
  const upsertSticker = useCallback(async (data: Omit<Sticker, 'id'> & { id?: string }) => {
    const item = { ...data, id: data.id ?? Date.now().toString(), images: data.images ?? [] } as Sticker;
    setStickers(prev => { const next = [...prev.filter(s => s.id !== item.id), item]; writeCache(CACHE_KEY_STICKERS, next); return next; });
    await supabase.from('stickers').upsert(item);
  }, []);

  const deleteSticker = useCallback(async (id: string) => {
    setStickers(prev => { const next = prev.filter(s => s.id !== id); writeCache(CACHE_KEY_STICKERS, next); return next; });
    await supabase.from('stickers').delete().eq('id', id);
  }, []);

  const upsertCategory = useCallback(async (data: Omit<Category, 'id'> & { id?: string }) => {
    const item = { ...data, id: data.id ?? Date.now().toString() } as Category;
    setCategories(prev => { const next = [...prev.filter(c => c.id !== item.id), item]; writeCache(CACHE_KEY_CATEGORIES, next); return next; });
    await supabase.from('categories').upsert(item);
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories(prev => { const next = prev.filter(c => c.id !== id); writeCache(CACHE_KEY_CATEGORIES, next); return next; });
    await supabase.from('categories').delete().eq('id', id);
  }, []);

  const upsertKeychain = useCallback(async (data: Omit<Keychain, 'id'> & { id?: string }) => {
    const item = { ...data, id: data.id ?? Date.now().toString(), images: data.images ?? [] } as Keychain;
    setKeychains(prev => { const next = [...prev.filter(k => k.id !== item.id), item]; writeCache(CACHE_KEY_KEYCHAINS, next); return next; });
    await supabase.from('keychains').upsert(item);
  }, []);

  const deleteKeychain = useCallback(async (id: string) => {
    setKeychains(prev => { const next = prev.filter(k => k.id !== id); writeCache(CACHE_KEY_KEYCHAINS, next); return next; });
    await supabase.from('keychains').delete().eq('id', id);
  }, []);

  const saveBanner = useCallback(async (b: BannerSettings) => {
    await supabase.from('settings').upsert({ key: BANNER_KEY, value: b });
  }, []);

  const resetDefaults = useCallback(async () => {
    await supabase.from('stickers').delete().neq('id', '');
    await supabase.from('categories').delete().neq('id', '');
    await supabase.from('categories').insert(DEFAULT_CATEGORIES);
    await supabase.from('stickers').insert(DEFAULT_STICKERS.map(s => ({ ...s, images: s.images ?? [] })));
  }, []);

  return (
    <DataContext.Provider value={{ stickers, categories, keychains, banner, loading, upsertSticker, deleteSticker, upsertCategory, deleteCategory, upsertKeychain, deleteKeychain, saveBanner, resetDefaults }}>
      {children}
    </DataContext.Provider>
  );
}
