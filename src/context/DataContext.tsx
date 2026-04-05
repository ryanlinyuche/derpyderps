import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Sticker, Category } from '../data/stickers';
import { DEFAULT_STICKERS, DEFAULT_CATEGORIES } from '../data/stickers';

const CACHE_KEY_STICKERS   = 'dd_cache_stickers';
const CACHE_KEY_CATEGORIES = 'dd_cache_categories';

function readCache<T>(key: string): T[] {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : []; }
  catch { return []; }
}
function writeCache(key: string, data: unknown[]) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

interface DataCtx {
  stickers: Sticker[];
  categories: Category[];
  loading: boolean;
  upsertSticker: (data: Omit<Sticker, 'id'> & { id?: string }) => Promise<void>;
  deleteSticker: (id: string) => Promise<void>;
  upsertCategory: (data: Omit<Category, 'id'> & { id?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  resetDefaults: () => Promise<void>;
}

const DataContext = createContext<DataCtx | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  // ── Seed from cache immediately so the UI is instant on reload ──────────────
  const cachedStickers   = readCache<Sticker>(CACHE_KEY_STICKERS);
  const cachedCategories = readCache<Category>(CACHE_KEY_CATEGORIES);

  const [stickers,   setStickers]   = useState<Sticker[]>(cachedStickers);
  const [categories, setCategories] = useState<Category[]>(cachedCategories);
  // Only show a loading state on the very first visit (empty cache)
  const [loading, setLoading] = useState(cachedStickers.length === 0 && cachedCategories.length === 0);

  // ── Fetch fresh data from Supabase in the background ──────────────────────
  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: stks }] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('stickers').select('*'),
      ]);

      if (!cats || cats.length === 0) {
        // First-ever load: seed defaults into Supabase
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
      setLoading(false);
    }
    load();
  }, []);

  // ── Real-time subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const stickersCh = supabase
      .channel('stickers-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stickers' }, ({ eventType, new: n, old: o }) => {
        setStickers(prev => {
          let next: Sticker[];
          if (eventType === 'DELETE') {
            next = prev.filter(s => s.id !== (o as Sticker).id);
          } else {
            next = [...prev.filter(s => s.id !== (n as Sticker).id), n as Sticker];
          }
          writeCache(CACHE_KEY_STICKERS, next);
          return next;
        });
      })
      .subscribe();

    const categoriesCh = supabase
      .channel('categories-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, ({ eventType, new: n, old: o }) => {
        setCategories(prev => {
          let next: Category[];
          if (eventType === 'DELETE') {
            next = prev.filter(c => c.id !== (o as Category).id);
          } else {
            next = [...prev.filter(c => c.id !== (n as Category).id), n as Category];
          }
          writeCache(CACHE_KEY_CATEGORIES, next);
          return next;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(stickersCh);
      supabase.removeChannel(categoriesCh);
    };
  }, []);

  // ── CRUD helpers ───────────────────────────────────────────────────────────
  const upsertSticker = useCallback(async (data: Omit<Sticker, 'id'> & { id?: string }) => {
    const row = { ...data, id: data.id ?? Date.now().toString(), images: data.images ?? [] };
    await supabase.from('stickers').upsert(row);
  }, []);

  const deleteSticker = useCallback(async (id: string) => {
    await supabase.from('stickers').delete().eq('id', id);
  }, []);

  const upsertCategory = useCallback(async (data: Omit<Category, 'id'> & { id?: string }) => {
    const row = { ...data, id: data.id ?? Date.now().toString() };
    await supabase.from('categories').upsert(row);
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
  }, []);

  const resetDefaults = useCallback(async () => {
    await supabase.from('stickers').delete().neq('id', '');
    await supabase.from('categories').delete().neq('id', '');
    await supabase.from('categories').insert(DEFAULT_CATEGORIES);
    await supabase.from('stickers').insert(
      DEFAULT_STICKERS.map(s => ({ ...s, images: s.images ?? [] }))
    );
  }, []);

  return (
    <DataContext.Provider value={{ stickers, categories, loading, upsertSticker, deleteSticker, upsertCategory, deleteCategory, resetDefaults }}>
      {children}
    </DataContext.Provider>
  );
}
