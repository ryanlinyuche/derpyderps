import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Sticker, Category } from '../data/stickers';
import { DEFAULT_STICKERS, DEFAULT_CATEGORIES } from '../data/stickers';

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
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Initial load + seed defaults if empty ──────────────────────────────────
  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: stks }] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('stickers').select('*'),
      ]);

      if (!cats || cats.length === 0) {
        // First-time setup: seed default categories & stickers
        await supabase.from('categories').insert(DEFAULT_CATEGORIES);
        await supabase.from('stickers').insert(
          DEFAULT_STICKERS.map(s => ({ ...s, images: s.images ?? [] }))
        );
        setCategories(DEFAULT_CATEGORIES);
        setStickers(DEFAULT_STICKERS);
      } else {
        setCategories(cats as Category[]);
        setStickers((stks ?? []) as Sticker[]);
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
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          setStickers(prev => {
            const filtered = prev.filter(s => s.id !== (n as Sticker).id);
            return [...filtered, n as Sticker];
          });
        } else if (eventType === 'DELETE') {
          setStickers(prev => prev.filter(s => s.id !== (o as Sticker).id));
        }
      })
      .subscribe();

    const categoriesCh = supabase
      .channel('categories-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, ({ eventType, new: n, old: o }) => {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          setCategories(prev => {
            const filtered = prev.filter(c => c.id !== (n as Category).id);
            return [...filtered, n as Category];
          });
        } else if (eventType === 'DELETE') {
          setCategories(prev => prev.filter(c => c.id !== (o as Category).id));
        }
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
