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
  { label: 'Blue', value: 'from-blue-400 to-cyan-500' },
  { label: 'Orange-Red', value: 'from-orange-400 to-red-500' },
  { label: 'Yellow', value: 'from-yellow-400 to-amber-500' },
  { label: 'Sky', value: 'from-sky-300 to-blue-500' },
  { label: 'Amber', value: 'from-amber-500 to-orange-600' },
  { label: 'Green', value: 'from-green-400 to-emerald-500' },
  { label: 'Pink', value: 'from-pink-400 to-rose-500' },
  { label: 'Purple', value: 'from-purple-400 to-indigo-500' },
];

const emptySticker = (): Omit<Sticker, 'id'> => ({
  name: '', image: '', price: 3.99, category_id: '', featured: false, description: ''
});

const emptyCategory = (): Omit<Category, 'id'> => ({
  name: '', emoji: '🦆', color: 'from-blue-400 to-cyan-500', description: ''
});

function ImageUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1 block">Image *</label>
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
            <button
              type="button"
              onClick={e => { e.preventDefault(); onChange(''); }}
              className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
            >×</button>
          </div>
        ) : (
          <>
            <span className="text-3xl">🖼️</span>
            <p className="text-sm font-semibold text-[#264653]">Drop image here or click to upload</p>
            <p className="text-xs text-slate-400">PNG, JPG, JPEG, WEBP</p>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
      </label>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'stickers' | 'categories'>('stickers');

  const [stickers, setStickers] = useState<Sticker[]>(getStickers());
  const [categories, setCategories] = useState<Category[]>(getCategories());

  // Sticker form state
  const [stickerForm, setStickerForm] = useState<Omit<Sticker, 'id'>>(emptySticker());
  const [editingStickerId, setEditingStickerId] = useState<string | null>(null);
  const [showStickerForm, setShowStickerForm] = useState(false);

  // Category form state
  const [catForm, setCatForm] = useState<Omit<Category, 'id'>>(emptyCategory());
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);

  useEffect(() => { saveStickers(stickers); }, [stickers]);
  useEffect(() => { saveCategories(categories); }, [categories]);

  const handleLogin = () => {
    if (adminLogin(password)) { setLoggedIn(true); setError(''); }
    else setError('Incorrect password.');
  };

  const handleLogout = () => { adminLogout(); setLoggedIn(false); navigate('/'); };

  // Sticker CRUD
  const saveSticker = () => {
    if (!stickerForm.name || !stickerForm.image || !stickerForm.category_id) return;
    if (editingStickerId) {
      setStickers(prev => prev.map(s => s.id === editingStickerId ? { ...stickerForm, id: editingStickerId } : s));
    } else {
      setStickers(prev => [...prev, { ...stickerForm, id: Date.now().toString() }]);
    }
    setStickerForm(emptySticker()); setEditingStickerId(null); setShowStickerForm(false);
  };
  const editSticker = (s: Sticker) => {
    setStickerForm({ name: s.name, image: s.image, price: s.price, category_id: s.category_id, featured: s.featured ?? false, description: s.description ?? '' });
    setEditingStickerId(s.id); setShowStickerForm(true);
  };
  const deleteSticker = (id: string) => { if (confirm('Delete this sticker?')) setStickers(prev => prev.filter(s => s.id !== id)); };

  // Category CRUD
  const saveCat = () => {
    if (!catForm.name) return;
    if (editingCatId) {
      setCategories(prev => prev.map(c => c.id === editingCatId ? { ...catForm, id: editingCatId } : c));
    } else {
      setCategories(prev => [...prev, { ...catForm, id: Date.now().toString() }]);
    }
    setCatForm(emptyCategory()); setEditingCatId(null); setShowCatForm(false);
  };
  const editCat = (c: Category) => {
    setCatForm({ name: c.name, emoji: c.emoji, color: c.color, description: c.description ?? '' });
    setEditingCatId(c.id); setShowCatForm(true);
  };
  const deleteCat = (id: string) => { if (confirm('Delete this category? Stickers in it won\'t be deleted.')) setCategories(prev => prev.filter(c => c.id !== id)); };

  const resetAll = () => {
    if (confirm('Reset to default stickers and categories?')) {
      setStickers(DEFAULT_STICKERS); setCategories(DEFAULT_CATEGORIES);
    }
  };

  // --- Login screen ---
  if (!loggedIn) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm" style={{ animation: 'bounceIn 0.4s ease forwards' }}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="font-display text-2xl text-[#264653]">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-1">Enter the password to continue</p>
        </div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mb-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        <button onClick={handleLogin} className="w-full bg-[#2a80b9] hover:bg-[#1f6a9e] text-white py-2.5 rounded-xl font-bold transition-all active:scale-95">
          Enter
        </button>
        <button onClick={() => navigate('/')} className="w-full text-slate-400 hover:text-slate-600 text-sm mt-3 transition-colors">
          ← Back to shop
        </button>
      </div>
    </div>
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-[#264653]">⚙️ Admin Panel</h1>
          <p className="text-slate-500 text-sm">Manage your stickers and categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetAll} className="text-xs text-orange-500 hover:text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors">
            Reset to defaults
          </button>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white/60 p-1.5 rounded-2xl w-fit shadow-sm">
        {(['stickers', 'categories'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl font-semibold text-sm capitalize transition-all ${
              tab === t ? 'bg-[#2a80b9] text-white shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'stickers' ? '🦆 Stickers' : '🗂️ Categories'}
          </button>
        ))}
      </div>

      {/* =================== STICKERS TAB =================== */}
      {tab === 'stickers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-500 text-sm">{stickers.length} stickers total</p>
            <button
              onClick={() => { setStickerForm(emptySticker()); setEditingStickerId(null); setShowStickerForm(true); }}
              className="bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-4 py-2 rounded-xl font-semibold text-sm shadow transition-all active:scale-95"
            >
              + Add Sticker
            </button>
          </div>

          {/* Sticker form */}
          {showStickerForm && (
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-[#9ED4FB]">
              <h3 className="font-display text-lg text-[#264653] mb-4">{editingStickerId ? 'Edit Sticker' : 'New Sticker'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Name *</label>
                  <input className="input-field" placeholder="Sticker name" value={stickerForm.name} onChange={e => setStickerForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Price *</label>
                  <input className="input-field" type="number" step="0.01" min="0" value={stickerForm.price} onChange={e => setStickerForm(f => ({ ...f, price: parseFloat(e.target.value) }))} />
                </div>
                <div className="sm:col-span-2">
                  <ImageUpload value={stickerForm.image} onChange={v => setStickerForm(f => ({ ...f, image: v }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Category *</label>
                  <select className="input-field" value={stickerForm.category_id} onChange={e => setStickerForm(f => ({ ...f, category_id: e.target.value }))}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
                  <input className="input-field" placeholder="Optional description" value={stickerForm.description ?? ''} onChange={e => setStickerForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="feat" checked={stickerForm.featured ?? false} onChange={e => setStickerForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                  <label htmlFor="feat" className="text-sm font-medium text-slate-700">⭐ Featured sticker</label>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={saveSticker} className="bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95">
                  {editingStickerId ? 'Save Changes' : 'Add Sticker'}
                </button>
                <button onClick={() => { setShowStickerForm(false); setStickerForm(emptySticker()); setEditingStickerId(null); }} className="text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Group by category */}
          {categories.map(cat => {
            const catStickers = stickers.filter(s => s.category_id === cat.id);
            if (!catStickers.length) return null;
            return (
              <div key={cat.id} className="mb-6">
                <h3 className="font-display text-base text-slate-700 mb-2 flex items-center gap-1.5">
                  <span>{cat.emoji}</span> {cat.name}
                  <span className="text-xs font-normal text-slate-400 ml-1">({catStickers.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catStickers.map(s => (
                    <div key={s.id} className="bg-white rounded-xl shadow flex items-center gap-3 p-3 hover:shadow-md transition-shadow">
                      <img src={s.image} alt={s.name} className="w-14 h-14 object-contain rounded-lg bg-[#DEF1FF] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">{s.name}</p>
                        <p className="text-blue-600 text-xs font-bold">${s.price.toFixed(2)}</p>
                        {s.featured && <span className="text-xs text-yellow-600">⭐ Featured</span>}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => editSticker(s)} className="text-xs bg-[#DEF1FF] hover:bg-[#9ED4FB]/30 text-[#2a80b9] px-2 py-1 rounded-lg transition-colors">Edit</button>
                        <button onClick={() => deleteSticker(s.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg transition-colors">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================== CATEGORIES TAB =================== */}
      {tab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-500 text-sm">{categories.length} categories total</p>
            <button
              onClick={() => { setCatForm(emptyCategory()); setEditingCatId(null); setShowCatForm(true); }}
              className="bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-4 py-2 rounded-xl font-semibold text-sm shadow transition-all active:scale-95"
            >
              + Add Category
            </button>
          </div>

          {/* Category form */}
          {showCatForm && (
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-[#9ED4FB]">
              <h3 className="font-display text-lg text-[#264653] mb-4">{editingCatId ? 'Edit Category' : 'New Category'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Name *</label>
                  <input className="input-field" placeholder="Category name" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map(em => (
                      <button key={em} onClick={() => setCatForm(f => ({ ...f, emoji: em }))} className={`w-9 h-9 rounded-lg text-xl transition-all ${catForm.emoji === em ? 'bg-[#9ED4FB]/30 ring-2 ring-[#2a80b9]' : 'bg-slate-50 hover:bg-slate-100'}`}>{em}</button>
                    ))}
                    <input className="input-field w-16" placeholder="..." value={catForm.emoji} onChange={e => setCatForm(f => ({ ...f, emoji: e.target.value }))} maxLength={4} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Color gradient</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COLOR_OPTIONS.map(c => (
                      <button key={c.value} onClick={() => setCatForm(f => ({ ...f, color: c.value }))} className={`h-8 rounded-lg bg-gradient-to-r ${c.value} text-white text-xs font-semibold transition-all ${catForm.color === c.value ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-70 hover:opacity-100'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
                  <input className="input-field" placeholder="Optional description" value={catForm.description ?? ''} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveCat} className="bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95">
                  {editingCatId ? 'Save Changes' : 'Add Category'}
                </button>
                <button onClick={() => { setShowCatForm(false); setCatForm(emptyCategory()); setEditingCatId(null); }} className="text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Category list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const count = stickers.filter(s => s.category_id === cat.id).length;
              return (
                <div key={cat.id} className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`h-2 bg-gradient-to-r ${cat.color}`} />
                  <div className="p-4 flex items-center gap-3">
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{cat.name}</p>
                      <p className="text-xs text-slate-400">{count} sticker{count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => editCat(cat)} className="text-xs bg-[#DEF1FF] hover:bg-[#9ED4FB]/30 text-[#2a80b9] px-2 py-1 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => deleteCat(cat.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg transition-colors">Delete</button>
                    </div>
                  </div>
                  {cat.description && <p className="text-xs text-slate-400 px-4 pb-3 -mt-1 truncate">{cat.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
