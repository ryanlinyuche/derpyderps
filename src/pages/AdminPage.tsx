import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminLoggedIn, adminLogin, adminLogout } from '../data/stickers';
import type { Sticker, Category, Keychain } from '../data/stickers';
import { useData } from '../context/DataContext';
import type { BannerSettings } from '../context/DataContext';
import { DEFAULT_BANNER } from '../context/DataContext';

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

const emptyKeychain = (): Omit<Keychain, 'id'> => ({
  name: '', image: '', images: [], price: 9.99, featured: false, description: '', collection: ''
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

// ─── Keychain form ────────────────────────────────────────────────────────────
function KeychainForm({
  initial, onSave, onCancel, hideCollection = false,
}: {
  initial: Omit<Keychain, 'id'> & { id?: string };
  onSave: (data: Omit<Keychain, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  hideCollection?: boolean;
}) {
  const [form, setForm] = useState(initial);

  return (
    <div className="bg-[#f0f8ff] rounded-2xl border border-[#9ED4FB] p-4 mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Name *</label>
          <input className="input-field" placeholder="Keychain name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Price *</label>
          <input className="input-field" type="number" step="0.01" min="0" value={form.price}
            onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} />
        </div>
        {!hideCollection && (
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Collection (optional)</label>
            <input className="input-field" placeholder="e.g. Duck Series" value={form.collection ?? ''}
              onChange={e => setForm(f => ({ ...f, collection: e.target.value }))} />
          </div>
        )}
        <div className="sm:col-span-2">
          <ImageUpload value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
          <input className="input-field" placeholder="Optional description" value={form.description ?? ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id={`kfeat-${form.id ?? 'new'}`} checked={form.featured ?? false}
            onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
            className="w-4 h-4 accent-blue-600" />
          <label htmlFor={`kfeat-${form.id ?? 'new'}`} className="text-sm font-medium text-slate-700">⭐ Featured keychain</label>
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
          {form.id ? 'Save Changes' : 'Add Keychain'}
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
  const { stickers, categories, keychains, banner, upsertSticker, deleteSticker: dbDeleteSticker, upsertCategory, deleteCategory: dbDeleteCategory, upsertKeychain, deleteKeychain: dbDeleteKeychain, saveBanner, resetDefaults } = useData();

  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Navigation: null = category grid, string = category id, 'banner' = banner editor, 'featured' = featured view
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);

  // Forms inside category detail
  const [keychainFormData, setKeychainFormData] = useState<(Omit<Keychain, 'id'> & { id?: string }) | null>(null);
  const [showAddSelector, setShowAddSelector] = useState(false);

  // Banner form state
  const [bannerForm, setBannerForm] = useState<BannerSettings>(DEFAULT_BANNER);
  const [bannerSaved, setBannerSaved] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Category form
  const [catForm, setCatForm] = useState<Omit<Category, 'id'>>(emptyCategory());
  const [showAddCatForm, setShowAddCatForm] = useState(false);

  // Sticker form inside a category detail
  const [stickerFormData, setStickerFormData] = useState<(Omit<Sticker, 'id'> & { id?: string }) | null>(null);

  const handleLogin = () => {
    if (adminLogin(password)) { setLoggedIn(true); setError(''); }
    else setError('Incorrect password.');
  };
  const handleLogout = () => { adminLogout(); setLoggedIn(false); navigate('/'); };

  const resetAll = async () => {
    if (confirm('Reset to default stickers and categories?')) {
      await resetDefaults();
    }
  };

  // ── Banner actions ──
  const openBannerEditor = () => {
    setBannerForm({ ...banner });
    setNewTag('');
    setShowBannerEditor(true);
  };

  const handleSaveBanner = async () => {
    await saveBanner(bannerForm);
    setBannerSaved(true);
    setTimeout(() => setBannerSaved(false), 1800);
  };

  // ── Category actions ──
  const openCategory = (cat: Category) => {
    setCatForm({ name: cat.name, emoji: cat.emoji, color: cat.color, description: cat.description ?? '' });
    setStickerFormData(null);
    setKeychainFormData(null);
    setShowAddSelector(false);
    setActiveCatId(cat.id);
  };

  const saveCatEdits = async () => {
    if (!catForm.name || !activeCatId) return;
    await upsertCategory({ ...catForm, id: activeCatId });
  };

  const saveNewCat = async () => {
    if (!catForm.name) return;
    await upsertCategory(catForm);
    setCatForm(emptyCategory());
    setShowAddCatForm(false);
  };

  const deleteCat = async (id: string) => {
    if (confirm("Delete this category? Stickers in it won't be deleted.")) {
      await dbDeleteCategory(id);
      if (activeCatId === id) setActiveCatId(null);
    }
  };

  // ── Sticker actions ──
  const saveSticker = async (data: Omit<Sticker, 'id'> & { id?: string }) => {
    if (!data.name || !data.image) return;
    await upsertSticker(data);
    setStickerFormData(null);
  };

  const deleteSticker = async (id: string) => {
    if (confirm('Delete this sticker?')) await dbDeleteSticker(id);
  };

  // ── Keychain actions ──
  const saveKeychain = async (data: Omit<Keychain, 'id'> & { id?: string }) => {
    if (!data.name || !data.image) return;
    await upsertKeychain(data);
    setKeychainFormData(null);
  };

  const deleteKeychain = async (id: string) => {
    if (confirm('Delete this keychain?')) await dbDeleteKeychain(id);
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
  const isSubPage = activeCatId || showBannerEditor || showFeatured;
  const Header = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {isSubPage && (
          <button onClick={() => { setActiveCatId(null); setShowBannerEditor(false); setShowFeatured(false); setShowAddSelector(false); }}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#2a80b9] transition-colors">
            ← Admin Panel
          </button>
        )}
        {!isSubPage && (
          <div>
            <h1 className="font-display text-3xl text-[#264653]">⚙️ Admin Panel</h1>
            <p className="text-slate-500 text-sm">Manage your shop</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {!isSubPage && (
          <button onClick={resetAll}
            className="text-xs text-orange-500 hover:text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors">
            Reset defaults
          </button>
        )}
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
    const catKeychains = keychains.filter(k => k.collection === cat.name);
    const totalItems = catStickers.length + catKeychains.length;

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
            <p className="text-xs text-slate-400">{totalItems} item{totalItems !== 1 ? 's' : ''} · {catStickers.length} sticker{catStickers.length !== 1 ? 's' : ''}, {catKeychains.length} keychain{catKeychains.length !== 1 ? 's' : ''}</p>
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

        {/* ── Items in this category ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Items</h3>
            <button
              onClick={() => { setStickerFormData(null); setKeychainFormData(null); setShowAddSelector(v => !v); }}
              className="bg-[#2a80b9] hover:bg-[#1f6a9e] text-white px-4 py-2 rounded-xl font-semibold text-sm shadow transition-all active:scale-95">
              {showAddSelector ? '✕ Cancel' : '+ Add Item'}
            </button>
          </div>

          {/* Type selector */}
          {showAddSelector && (
            <div className="flex gap-3 mb-4 p-3 bg-white rounded-2xl border border-[#9ED4FB] shadow-sm">
              <p className="text-xs font-semibold text-slate-500 self-center mr-1">Add a:</p>
              <button
                onClick={() => { setStickerFormData(emptySticker(activeCatId)); setShowAddSelector(false); }}
                className="flex items-center gap-2 flex-1 bg-[#DEF1FF] hover:bg-[#9ED4FB]/40 text-[#264653] px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors border border-[#9ED4FB]">
                🖼️ Sticker
              </button>
              <button
                onClick={() => { setKeychainFormData({ ...emptyKeychain(), collection: cat.name }); setShowAddSelector(false); }}
                className="flex items-center gap-2 flex-1 bg-[#DEF1FF] hover:bg-[#9ED4FB]/40 text-[#264653] px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors border border-[#9ED4FB]">
                🔑 Keychain
              </button>
            </div>
          )}

          {/* New sticker form */}
          {stickerFormData && !stickerFormData.id && (
            <StickerForm initial={stickerFormData} onSave={saveSticker} onCancel={() => setStickerFormData(null)} />
          )}

          {/* New keychain form */}
          {keychainFormData && !keychainFormData.id && (
            <KeychainForm
              initial={keychainFormData}
              onSave={data => saveKeychain({ ...data, collection: cat.name })}
              onCancel={() => setKeychainFormData(null)}
              hideCollection
            />
          )}

          {totalItems === 0 && !stickerFormData && !keychainFormData && !showAddSelector && (
            <p className="text-slate-400 text-sm italic py-4 text-center">No items in this category yet.</p>
          )}

          <div className="flex flex-col gap-3 mt-3">
            {/* Stickers */}
            {catStickers.map(s => (
              <div key={`s-${s.id}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-[#DEF1FF] flex items-center gap-4 p-3 hover:shadow-md transition-shadow">
                  <img src={s.image} alt={s.name}
                    className="w-16 h-16 object-contain rounded-xl bg-[#DEF1FF] flex-shrink-0 mix-blend-multiply p-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">🖼️ Sticker</span>
                      {s.featured && <span className="text-xs text-yellow-600">⭐</span>}
                    </div>
                    <p className="font-semibold text-sm text-[#264653] truncate">{s.name}</p>
                    <p className="text-[#2a80b9] text-xs font-bold">${s.price.toFixed(2)}</p>
                  </div>
                  {(s.images ?? []).length > 0 && (
                    <span className="text-xs text-slate-400 flex-shrink-0">{(s.images ?? []).length} angle{(s.images ?? []).length !== 1 ? 's' : ''}</span>
                  )}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setKeychainFormData(null); setStickerFormData(stickerFormData?.id === s.id ? null : { ...s }); }}
                      className="text-xs bg-[#DEF1FF] hover:bg-[#9ED4FB]/40 text-[#2a80b9] px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      {stickerFormData?.id === s.id ? 'Close' : 'Edit'}
                    </button>
                    <button onClick={() => deleteSticker(s.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                {stickerFormData?.id === s.id && (
                  <StickerForm initial={stickerFormData} onSave={saveSticker} onCancel={() => setStickerFormData(null)} />
                )}
              </div>
            ))}

            {/* Keychains */}
            {catKeychains.map(k => (
              <div key={`k-${k.id}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-[#DEF1FF] flex items-center gap-4 p-3 hover:shadow-md transition-shadow">
                  <img src={k.image} alt={k.name}
                    className="w-16 h-16 object-contain rounded-xl bg-[#DEF1FF] flex-shrink-0 mix-blend-multiply p-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs bg-blue-50 text-[#2a80b9] px-1.5 py-0.5 rounded font-medium">🔑 Keychain</span>
                      {k.featured && <span className="text-xs text-yellow-600">⭐</span>}
                    </div>
                    <p className="font-semibold text-sm text-[#264653] truncate">{k.name}</p>
                    <p className="text-[#2a80b9] text-xs font-bold">${k.price.toFixed(2)}</p>
                  </div>
                  {(k.images ?? []).length > 0 && (
                    <span className="text-xs text-slate-400 flex-shrink-0">{(k.images ?? []).length} angle{(k.images ?? []).length !== 1 ? 's' : ''}</span>
                  )}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setStickerFormData(null); setKeychainFormData(keychainFormData?.id === k.id ? null : { ...k }); }}
                      className="text-xs bg-[#DEF1FF] hover:bg-[#9ED4FB]/40 text-[#2a80b9] px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      {keychainFormData?.id === k.id ? 'Close' : 'Edit'}
                    </button>
                    <button onClick={() => deleteKeychain(k.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                {keychainFormData?.id === k.id && (
                  <KeychainForm
                    initial={keychainFormData}
                    onSave={data => saveKeychain({ ...data, collection: cat.name })}
                    onCancel={() => setKeychainFormData(null)}
                    hideCollection
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
  // FEATURED VIEW
  if (showFeatured) {
    const featuredStickers = stickers.filter(s => s.featured);
    const featuredKeychains = keychains.filter(k => k.featured);
    const totalFeatured = featuredStickers.length + featuredKeychains.length;

    const unfeatureSticker = async (s: Sticker) => upsertSticker({ ...s, featured: false });
    const unfeatureKeychain = async (k: Keychain) => upsertKeychain({ ...k, featured: false });

    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Header />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-xl shadow">⭐</div>
          <div>
            <h2 className="font-display text-2xl text-[#264653]">Featured Items</h2>
            <p className="text-xs text-slate-400">{totalFeatured} featured item{totalFeatured !== 1 ? 's' : ''} · {featuredStickers.length} sticker{featuredStickers.length !== 1 ? 's' : ''}, {featuredKeychains.length} keychain{featuredKeychains.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {totalFeatured === 0 ? (
          <p className="text-slate-400 text-sm italic py-8 text-center">No featured items yet. Mark stickers or keychains as ⭐ Featured when editing them.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {featuredStickers.map(s => {
              const cat = categories.find(c => c.id === s.category_id);
              return (
                <div key={`fs-${s.id}`} className="bg-white rounded-2xl shadow-sm border border-[#DEF1FF] flex items-center gap-4 p-3 hover:shadow-md transition-shadow">
                  <img src={s.image} alt={s.name}
                    className="w-16 h-16 object-contain rounded-xl bg-[#DEF1FF] flex-shrink-0 mix-blend-multiply p-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">🖼️ Sticker</span>
                      {cat && <span className="text-xs text-slate-400">{cat.emoji} {cat.name}</span>}
                    </div>
                    <p className="font-semibold text-sm text-[#264653] truncate">{s.name}</p>
                    <p className="text-[#2a80b9] text-xs font-bold">${s.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => unfeatureSticker(s)}
                      className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      ★ Unfeature
                    </button>
                    <button onClick={() => deleteSticker(s.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {featuredKeychains.map(k => (
              <div key={`fk-${k.id}`} className="bg-white rounded-2xl shadow-sm border border-[#DEF1FF] flex items-center gap-4 p-3 hover:shadow-md transition-shadow">
                <img src={k.image} alt={k.name}
                  className="w-16 h-16 object-contain rounded-xl bg-[#DEF1FF] flex-shrink-0 mix-blend-multiply p-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs bg-blue-50 text-[#2a80b9] px-1.5 py-0.5 rounded font-medium">🔑 Keychain</span>
                    {k.collection && <span className="text-xs text-slate-400">{k.collection}</span>}
                  </div>
                  <p className="font-semibold text-sm text-[#264653] truncate">{k.name}</p>
                  <p className="text-[#2a80b9] text-xs font-bold">${k.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => unfeatureKeychain(k)}
                    className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                    ★ Unfeature
                  </button>
                  <button onClick={() => deleteKeychain(k.id)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BANNER EDITOR VIEW
  if (showBannerEditor) return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Header />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9ED4FB] to-[#2a80b9] flex items-center justify-center text-xl shadow">🎨</div>
        <div>
          <h2 className="font-display text-2xl text-[#264653]">Home Banner</h2>
          <p className="text-xs text-slate-400">Edits appear live for all visitors</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#DEF1FF] p-5 flex flex-col gap-4">
        {/* Live preview */}
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#9ED4FB' }}>
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Preview</p>
          <p className="font-display text-2xl md:text-3xl leading-tight" style={{ color: '#264653' }}>
            {bannerForm.title || 'Welcome to'}<br />
            <span style={{ color: '#2a80b9' }}>{bannerForm.titleHighlight || 'Derpy Derps'}</span> {bannerForm.emoji}
          </p>
          <p className="text-sm mt-2 mb-3" style={{ color: '#264653', opacity: 0.75 }}>{bannerForm.subtitle}</p>
          <div className="flex flex-wrap gap-2">
            {bannerForm.tags.map(t => (
              <span key={t} className="text-xs px-3 py-1 rounded-full border" style={{ background: 'rgba(38,70,83,0.1)', color: '#264653', borderColor: 'rgba(38,70,83,0.2)' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Title (line 1)</label>
            <input className="input-field" value={bannerForm.title}
              onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Title Highlight (line 2, blue)</label>
            <input className="input-field" value={bannerForm.titleHighlight}
              onChange={e => setBannerForm(f => ({ ...f, titleHighlight: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Emoji</label>
            <input className="input-field" value={bannerForm.emoji} maxLength={4}
              onChange={e => setBannerForm(f => ({ ...f, emoji: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Subtitle</label>
            <textarea className="input-field resize-none" rows={2} value={bannerForm.subtitle}
              onChange={e => setBannerForm(f => ({ ...f, subtitle: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <ImageUpload
              value={bannerForm.backgroundImage ?? ''}
              onChange={v => setBannerForm(f => ({ ...f, backgroundImage: v || undefined }))}
              label="Background Image (optional)"
            />
            {bannerForm.backgroundImage && (
              <button
                onClick={() => setBannerForm(f => ({ ...f, backgroundImage: undefined }))}
                className="mt-1.5 text-xs text-red-400 hover:text-red-600 transition-colors">
                × Remove background image
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-2 block">Badges</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {bannerForm.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs bg-[#DEF1FF] text-[#264653] px-3 py-1.5 rounded-full border border-[#9ED4FB]">
                {tag}
                <button onClick={() => setBannerForm(f => ({ ...f, tags: f.tags.filter((_, idx) => idx !== i) }))}
                  className="text-red-400 hover:text-red-600 font-bold leading-none">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input-field flex-1" placeholder="Add a badge…" value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newTag.trim()) {
                  setBannerForm(f => ({ ...f, tags: [...f.tags, newTag.trim()] }));
                  setNewTag('');
                }
              }} />
            <button
              onClick={() => { if (newTag.trim()) { setBannerForm(f => ({ ...f, tags: [...f.tags, newTag.trim()] })); setNewTag(''); } }}
              className="bg-[#DEF1FF] hover:bg-[#9ED4FB]/40 text-[#2a80b9] px-4 py-2 rounded-xl font-semibold text-sm transition-colors">
              + Add
            </button>
          </div>
        </div>

        <button onClick={handleSaveBanner}
          className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-all active:scale-95 shadow-md"
          style={{ background: bannerSaved ? '#22c55e' : '#2a80b9' }}>
          {bannerSaved ? '✓ Saved!' : 'Save Banner'}
        </button>
      </div>
    </main>
  );

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

      {/* Banner card */}
      <button
        onClick={openBannerEditor}
        className="group w-full bg-gradient-to-r from-[#9ED4FB]/40 to-[#DEF1FF] rounded-2xl border border-[#9ED4FB] hover:shadow-md text-left transition-all hover:-translate-y-0.5 active:scale-[0.99] mb-4 overflow-hidden"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#9ED4FB] to-[#2a80b9]" />
        <div className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9ED4FB] to-[#2a80b9] flex items-center justify-center text-2xl shadow flex-shrink-0">🎨</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#264653] group-hover:text-[#2a80b9] transition-colors">Home Banner</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">"{banner.title} {banner.titleHighlight}" · {banner.tags.length} badge{banner.tags.length !== 1 ? 's' : ''}</p>
          </div>
          <span className="text-slate-300 group-hover:text-[#2a80b9] text-xl transition-colors flex-shrink-0">›</span>
        </div>
      </button>

      {/* Featured card */}
      {(() => {
        const totalFeatured = stickers.filter(s => s.featured).length + keychains.filter(k => k.featured).length;
        return (
          <button
            onClick={() => setShowFeatured(true)}
            className="group w-full bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 hover:shadow-md text-left transition-all hover:-translate-y-0.5 active:scale-[0.99] mb-4 overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-yellow-400 to-amber-500" />
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl shadow flex-shrink-0">⭐</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#264653] group-hover:text-amber-600 transition-colors">Featured Items</p>
                <p className="text-xs text-slate-400 mt-0.5">{totalFeatured} item{totalFeatured !== 1 ? 's' : ''} featured across stickers &amp; keychains</p>
              </div>
              <span className="text-slate-300 group-hover:text-amber-500 text-xl transition-colors flex-shrink-0">›</span>
            </div>
          </button>
        );
      })()}

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map(cat => {
          const stickerCount = stickers.filter(s => s.category_id === cat.id).length;
          const keychainCount = keychains.filter(k => k.collection === cat.name).length;
          const count = stickerCount + keychainCount;
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
                  <p className="text-xs text-slate-400 mt-0.5">{count} item{count !== 1 ? 's' : ''}{keychainCount > 0 ? ` · ${keychainCount} 🔑` : ''}</p>
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
