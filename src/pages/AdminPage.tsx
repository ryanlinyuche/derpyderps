import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStickers, getCategories, saveStickers, saveCategories,
  isAdminLoggedIn, adminLogin, adminLogout,
  DEFAULT_STICKERS, DEFAULT_CATEGORIES
} from '../data/stickers';
import type { Sticker, Category } from '../data/stickers';

const EMOJI_OPTIONS = ['🏮','🦆','⭐','❄️','🍁','🍂','🎃','🐣','🌸','🎄','🎉','🧸'];
const COLOR_OPTIONS = [
  { label: 'Blue',       value: 'from-blue-400 to-cyan-500' },
  { label: 'Orange-Red', value: 'from-orange-400 to-red-500' },
  { label: 'Yellow',     value: 'from-yellow-400 to-amber-500' },
  { label: 'Sky',        value: 'from-sky-300 to-blue-500' },
  { label: 'Amber',      value: 'from-amber-500 to-orange-600' },
  { label: 'Green',      value: 'from-green-400 to-emerald-500' },
  { label: 'Pink',       value: 'from-pink-400 to-rose-500' },
  { label: 'Purple',     value: 'from-purple-400 to-indigo-500' },
];

const emptySticker = (category_id = ''): Omit<Sticker, 'id'> => ({
  name: '', image: '', images: [], price: 3.99, category_id, featured: false, description: ''
});

const emptyCategory = (): Omit<Category, 'id'> => ({
  name: '', emoji: '🦆', color: 'from-blue-400 to-cyan-500', description: ''
});

// ─── Shared image upload widget ───────────────────────────────────────────────
function ImageUpload({ value, onChange, label = 'Image *' }: {
  value: string; onChange: (v: string) => void; label?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
      <label
        className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed cursor-pointer transition-all"
        style={{
          borderColor: dragging ? '#2a80b9' : '#9ED4FB',
          background: dragging ? 'rgba(42,128,185,0.05)' : '#DEF1FF',
          padding: value ? '12px' : '24px',
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
      >
        {value ? (
          <div className="flex items-center gap-3 w-full">
            <img src={value} alt="preview" className="w-16 h-16 object-contain rounded-lg bg-white mix-blend-multiply flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#264653] mb-1">Image uploaded ✓</p>
              <p className="text-xs text-slate-400">Click to replace</p>
            </div>
            <button type="button" onClick={e => { e.preventDefault(); onChange(''); }}
              className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
          </div>
        ) : (
          <>
            <span className="text-3xl">🖼️</span>
            <p className="text-sm font-semibold text-[#264653]">Drop image here or click to upload</p>
            <p className="text-xs text-slate-400">PNG, JPG, JPEG, WEBP</p>
          </>
        )}
        <input type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
      </label>
    </div>
  );
}

// ─── Sticker form (inline, used inside category detail view) ──────────────────
function StickerForm({
  initial, onSave, onCancel,
}: {
  initial: Omit<Sticker, 'id'> & { id?: string };
  onSave: (data: Omit<Sticker, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);

  return (
    <div className="bg-[#f0f8ff] rounded-2xl border border-[#9ED4FB] p-4 mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Name *</label>
          <input className="input-field" placeholder="Sticker name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Price *</label>
          <input className="input-field" type="number" step="0.01" min="0" value={form.price}
            onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} />
        </div>
        <div className="sm:col-span-2">
          <ImageUpload value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
          <input className="input-field" placeholder="Optional description" value={form.description ?? ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id={`feat-${form.id ?? 'new'}`} checked={form.featured ?? false}
            onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
            className="w-4 h-4 accent-blue-600" />
          <label htmlFor={`feat-${form.id ?? 'new'}`} className="text-sm font-medium text-slate-700">⭐ Featured sticker</label>
        </div>
      </div>

      {/* Additional angles */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Additional Angles
            <span className="ml-1.5 font-normal text-slate-400 normal-case">(shown in gallery)</span>
          </span>
          <button type="button"
            onClick={() => setForm(f => ({ ...f, images: [...(f.images ?? []), ''] }))}
            className="text-xs font-bold text-[#2a80b9] hover:text-[#1f6a9e] border border-[#9ED4FB] px-3 py-1 rounded-lg transition-colors">
            + Add Angle
          </button>
        </div>
        {(form.images ?? []).length === 0 ? (
          <p className="text-xs text-slate-400 italic">No extra angles yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(form.images ?? []).map((img, i) => (
              <div key={i} className="relative">
                <ImageUpload
                  value={img}
                  onChange={v => setForm(f => {
                    const imgs = [...(f.images ?? [])]; imgs[i] = v;
                    return { ...f, images: imgs };
                  })}
                />
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, images: (f.images ?? []).filter((_, idx) => idx !== i) }))}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow transition-colors"
                  title="Remove">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => onSave(form)}
          className="bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95">
          {form.id ? 'Save Changes' : 'Add Sticker'}
        </button>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl text-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main admin page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [stickers, setStickers] = useState<Sticker[]>(getStickers());
  const [categories, setCategories] = useState<Category[]>(getCategories());

  // Navigation: null = category grid, string = category id being edited
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  // Category form (used both for "add new" and "edit existing" in detail view)
  const [catForm, setCatForm] = useState<Omit<Category, 'id'>>(emptyCategory());
  const [showAddCatForm, setShowAddCatForm] = useState(false);

  // Sticker form inside a category detail
  const [stickerFormData, setStickerFormData] = useState<(Omit<Sticker, 'id'> & { id?: string }) | null>(null);

  useEffect(() => { saveStickers(stickers); }, [stickers]);
  useEffect(() => { saveCategories(categories); }, [categories]);

  const handleLogin = () => {
    if (adminLogin(password)) { setLoggedIn(true); setError(''); }
    else setError('Incorrect password.');
  };
  const handleLogout = () => { adminLogout(); setLoggedIn(false); navigate('/'); };

  const resetAll = () => {
    if (confirm('Reset to default stickers and categories?')) {
      setStickers(DEFAULT_STICKERS); setCategories(DEFAULT_CATEGORIES);
    }
  };

  // ── Category actions ──
  const openCategory = (cat: Category) => {
    setCatForm({ name: cat.name, emoji: cat.emoji, color: cat.color, description: cat.description ?? '' });
    setStickerFormData(null);
    setActiveCatId(cat.id);
  };

  const saveCatEdits = () => {
    if (!catForm.name || !activeCatId) return;
    setCategories(prev => prev.map(c => c.id === activeCatId ? { ...catForm, id: activeCatId } : c));
  };

  const saveNewCat = () => {
    if (!catForm.name) return;
    setCategories(prev => [...prev, { ...catForm, id: Date.now().toString() }]);
    setCatForm(emptyCategory());
    setShowAddCatForm(false);
  };

  const deleteCat = (id: string) => {
    if (confirm("Delete this category? Stickers in it won't be deleted.")) {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (activeCatId === id) setActiveCatId(null);
    }
  };

  // ── Sticker actions ──
  const saveSticker = (data: Omit<Sticker, 'id'> & { id?: string }) => {
    if (!data.name || !data.image) return;
    if (data.id) {
      setStickers(prev => prev.map(s => s.id === data.id ? { ...data, id: data.id! } : s));
    } else {
      setStickers(prev => [...prev, { ...data, id: Date.now().toString() }]);
    }
    setStickerFormData(null);
  };

  const deleteSticker = (id: string) => {
    if (confirm('Delete this sticker?')) setStickers(prev => prev.filter(s => s.id !== id));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGIN SCREEN
  if (!loggedIn) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm" style={{ animation: 'bounceIn 0.4s ease forwards' }}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="font-display text-2xl text-[#264653]">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-1">Enter the password to continue</p>
        </div>
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mb-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        <button onClick={handleLogin}
          className="w-full bg-[#2a80b9] hover:bg-[#1f6a9e] text-white py-2.5 rounded-xl font-bold transition-all active:scale-95">
          Enter
        </button>
        <button onClick={() => navigate('/')}
          className="w-full text-slate-400 hover:text-slate-600 text-sm mt-3 transition-colors">
          ← Back to shop
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SHARED HEADER
  const Header = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {activeCatId && (
          <button onClick={() => setActiveCatId(null)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#2a80b9] transition-colors">
            ← All Categories
          </button>
        )}
        {!activeCatId && (
          <div>
            <h1 className="font-display text-3xl text-[#264653]">⚙️ Admin Panel</h1>
            <p className="text-slate-500 text-sm">Select a category to manage its stickers</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={resetAll}
          className="text-xs text-orange-500 hover:text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors">
          Reset defaults
        </button>
        <button onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
          Logout
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // CATEGORY DETAIL VIEW
  if (activeCatId) {
    const cat = categories.find(c => c.id === activeCatId);
    if (!cat) { setActiveCatId(null); return null; }
    const catStickers = stickers.filter(s => s.category_id === activeCatId);

    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Header />

        {/* Category heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl shadow`}>
            {cat.emoji}
          </div>
          <div>
            <h2 className="font-display text-2xl text-[#264653]">{cat.name}</h2>
            <p className="text-xs text-slate-400">{catStickers.length} sticker{catStickers.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => deleteCat(activeCatId)}
            className="ml-auto text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition-colors">
            Delete Category
          </button>
        </div>

        {/* ── Category edit form ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#DEF1FF] p-5 mb-8">
          <h3 className="font-semibold text-sm text-slate-600 mb-4 uppercase tracking-wide">Category Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Name *</label>
              <input className="input-field" placeholder="Category name" value={catForm.name}
                onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(em => (
                  <button key={em} onClick={() => setCatForm(f => ({ ...f, emoji: em }))}
                    className={`w-9 h-9 rounded-lg text-xl transition-all ${catForm.emoji === em ? 'bg-[#9ED4FB]/30 ring-2 ring-[#2a80b9]' : 'bg-slate-50 hover:bg-slate-100'}`}>
                    {em}
                  </button>
                ))}
                <input className="input-field w-16" placeholder="..." value={catForm.emoji}
                  onChange={e => setCatForm(f => ({ ...f, emoji: e.target.value }))} maxLength={4} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Color</label>
              <div className="grid grid-cols-2 gap-1.5">
                {COLOR_OPTIONS.map(c => (
                  <button key={c.value} onClick={() => setCatForm(f => ({ ...f, color: c.value }))}
                    className={`h-8 rounded-lg bg-gradient-to-r ${c.value} text-white text-xs font-semibold transition-all ${catForm.color === c.value ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-70 hover:opacity-100'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
              <input className="input-field" placeholder="Optional description" value={catForm.description ?? ''}
                onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <button onClick={saveCatEdits}
            className="mt-4 bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95">
            Save Category
          </button>
        </section>

        {/* ── Stickers in this category ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Stickers</h3>
            <button
              onClick={() => setStickerFormData(emptySticker(activeCatId))}
              className="bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-4 py-2 rounded-xl font-semibold text-sm shadow transition-all active:scale-95">
              + Add Sticker
            </button>
          </div>

          {/* New sticker form */}
          {stickerFormData && !stickerFormData.id && (
            <StickerForm
              initial={stickerFormData}
              onSave={saveSticker}
              onCancel={() => setStickerFormData(null)}
            />
          )}

          {catStickers.length === 0 && !stickerFormData && (
            <p className="text-slate-400 text-sm italic py-4 text-center">No stickers in this category yet.</p>
          )}

          <div className="flex flex-col gap-3 mt-3">
            {catStickers.map(s => (
              <div key={s.id}>
                <div className="bg-white rounded-2xl shadow-sm border border-[#DEF1FF] flex items-center gap-4 p-3 hover:shadow-md transition-shadow">
                  <img src={s.image} alt={s.name}
                    className="w-16 h-16 object-contain rounded-xl bg-[#DEF1FF] flex-shrink-0 mix-blend-multiply p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#264653] truncate">{s.name}</p>
                    <p className="text-[#2a80b9] text-xs font-bold">${s.price.toFixed(2)}</p>
                    {s.featured && <span className="text-xs text-yellow-600">⭐ Featured</span>}
                    {s.description && <p className="text-xs text-slate-400 truncate">{s.description}</p>}
                  </div>
                  {(s.images ?? []).length > 0 && (
                    <span className="text-xs text-slate-400 flex-shrink-0">{(s.images ?? []).length} angle{(s.images ?? []).length !== 1 ? 's' : ''}</span>
                  )}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setStickerFormData(stickerFormData?.id === s.id ? null : { ...s })}
                      className="text-xs bg-[#DEF1FF] hover:bg-[#9ED4FB]/40 text-[#2a80b9] px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      {stickerFormData?.id === s.id ? 'Close' : 'Edit'}
                    </button>
                    <button onClick={() => deleteSticker(s.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      Delete
                    </button>
                  </div>
                </div>

                {/* Inline edit form for this sticker */}
                {stickerFormData?.id === s.id && (
                  <StickerForm
                    initial={stickerFormData}
                    onSave={saveSticker}
                    onCancel={() => setStickerFormData(null)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CATEGORY GRID (main view)
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Header />

      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-500 text-sm">{categories.length} categories</p>
        <button
          onClick={() => { setCatForm(emptyCategory()); setShowAddCatForm(v => !v); }}
          className="bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-4 py-2 rounded-xl font-semibold text-sm shadow transition-all active:scale-95">
          + Add Category
        </button>
      </div>

      {/* Add category form */}
      {showAddCatForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-[#9ED4FB] p-5 mb-6">
          <h3 className="font-display text-lg text-[#264653] mb-4">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Name *</label>
              <input className="input-field" placeholder="Category name" value={catForm.name}
                onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(em => (
                  <button key={em} onClick={() => setCatForm(f => ({ ...f, emoji: em }))}
                    className={`w-9 h-9 rounded-lg text-xl transition-all ${catForm.emoji === em ? 'bg-[#9ED4FB]/30 ring-2 ring-[#2a80b9]' : 'bg-slate-50 hover:bg-slate-100'}`}>
                    {em}
                  </button>
                ))}
                <input className="input-field w-16" placeholder="..." value={catForm.emoji}
                  onChange={e => setCatForm(f => ({ ...f, emoji: e.target.value }))} maxLength={4} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Color</label>
              <div className="grid grid-cols-2 gap-1.5">
                {COLOR_OPTIONS.map(c => (
                  <button key={c.value} onClick={() => setCatForm(f => ({ ...f, color: c.value }))}
                    className={`h-8 rounded-lg bg-gradient-to-r ${c.value} text-white text-xs font-semibold transition-all ${catForm.color === c.value ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-70 hover:opacity-100'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
              <input className="input-field" placeholder="Optional description" value={catForm.description ?? ''}
                onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={saveNewCat}
              className="bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95">
              Add Category
            </button>
            <button onClick={() => setShowAddCatForm(false)}
              className="text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map(cat => {
          const count = stickers.filter(s => s.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => openCategory(cat)}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-[#DEF1FF] overflow-hidden text-left transition-all hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className={`h-2 bg-gradient-to-r ${cat.color}`} />
              <div className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow flex-shrink-0`}>
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#264653] truncate group-hover:text-[#2a80b9] transition-colors">{cat.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{count} sticker{count !== 1 ? 's' : ''}</p>
                  {cat.description && <p className="text-xs text-slate-400 truncate mt-0.5">{cat.description}</p>}
                </div>
                <span className="text-slate-300 group-hover:text-[#2a80b9] text-xl transition-colors flex-shrink-0">›</span>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
