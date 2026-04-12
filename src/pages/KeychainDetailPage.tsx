import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { Keychain } from '../data/stickers';
import { useCart } from '../context/CartContext';

export default function KeychainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { keychains, loading } = useData();

  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const keychain = useMemo(() => keychains.find(k => k.id === id) ?? null, [keychains, id]);
  const related = useMemo(() => keychains.filter(k => k.id !== id && (!keychain?.collection || k.collection === keychain.collection)).slice(0, 6), [keychains, id, keychain]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="text-5xl animate-float">🔑</div>
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  );

  if (!keychain) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">🔑</div>
      <p className="text-[#264653] font-semibold text-lg">Keychain not found</p>
      <button onClick={() => navigate('/keychains')} className="text-[#2a80b9] hover:underline text-sm">← Back to keychains</button>
    </div>
  );

  const allImages = [keychain.image, ...(keychain.images ?? [])].filter(Boolean);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart({ ...keychain, kind: 'keychain' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 flex-wrap">
        <Link to="/" className="hover:text-[#2a80b9] transition-colors">Home</Link>
        <span>/</span>
        <Link to="/keychains" className="hover:text-[#2a80b9] transition-colors">🔑 Keychains</Link>
        {keychain.collection && <><span>/</span><span className="text-[#264653] font-medium">{keychain.collection}</span></>}
        <span>/</span>
        <span className="text-[#264653] font-medium">{keychain.name}</span>
      </nav>

      {/* Main product area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          <div
            className="relative rounded-3xl overflow-hidden flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #DEF1FF 0%, #9ED4FB33 100%)', minHeight: 420 }}
          >
            <img
              src={allImages[activeImg]}
              alt={keychain.name}
              className="max-h-[400px] max-w-full object-contain mix-blend-multiply drop-shadow-xl transition-all duration-300"
              style={{ padding: '32px' }}
            />
            {keychain.featured && (
              <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow">⭐ Featured</span>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-slate-600 transition-all">‹</button>
                <button onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-slate-600 transition-all">›</button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className="rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center"
                  style={{ borderColor: i === activeImg ? '#2a80b9' : 'transparent', background: '#DEF1FF', width: 68, height: 68, boxShadow: i === activeImg ? '0 0 0 2px #9ED4FB' : 'none' }}>
                  <img src={img} alt={`angle ${i + 1}`} className="w-full h-full object-contain mix-blend-multiply p-1.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          {keychain.collection && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full w-fit"
              style={{ background: '#DEF1FF', color: '#2a80b9', border: '1.5px solid #9ED4FB' }}>
              🔑 {keychain.collection}
            </span>
          )}

          <h1 className="font-display text-3xl md:text-4xl leading-tight" style={{ color: '#264653' }}>
            {keychain.name}
          </h1>
          <p className="text-2xl font-bold" style={{ color: '#2a80b9' }}>${keychain.price.toFixed(2)}</p>

          {keychain.description && (
            <p className="text-slate-600 text-sm leading-relaxed">{keychain.description}</p>
          )}

          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</span>
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-[#9ED4FB] px-1">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-[#2a80b9] font-bold text-lg rounded-lg hover:bg-[#DEF1FF] transition-colors">−</button>
              <span className="w-6 text-center font-semibold text-[#264653]">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 flex items-center justify-center text-[#2a80b9] font-bold text-lg rounded-lg hover:bg-[#DEF1FF] transition-colors">+</button>
            </div>
          </div>

          <button onClick={handleAddToCart}
            className="mt-2 w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all active:scale-95 shadow-lg"
            style={{ background: added ? '#22c55e' : '#2a80b9' }}>
            {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
          </button>

          <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors text-left">← Back</button>

          <div className="mt-2 bg-white rounded-2xl p-4 border border-[#DEF1FF] shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Details</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><span className="text-[#2a80b9]">✦</span> High-quality acrylic keychain</li>
              <li className="flex items-center gap-2"><span className="text-[#2a80b9]">✦</span> Durable &amp; scratch-resistant</li>
              <li className="flex items-center gap-2"><span className="text-[#2a80b9]">✦</span> Includes keyring attachment</li>
              <li className="flex items-center gap-2"><span className="text-[#2a80b9]">✦</span> Approximately 2 inches</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display text-2xl mb-4" style={{ color: '#264653' }}>More Keychains</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(k => <RelatedCard key={k.id} keychain={k} />)}
          </div>
        </section>
      )}
    </main>
  );
}

function RelatedCard({ keychain }: { keychain: Keychain }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ ...keychain, kind: 'keychain' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div onClick={() => navigate(`/keychain/${keychain.id}`)}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
      <div className="flex items-center justify-center p-4 h-36" style={{ background: 'linear-gradient(135deg, #DEF1FF 0%, rgba(158,212,251,0.2) 100%)' }}>
        <img src={keychain.image} alt={keychain.name} className="max-h-28 max-w-full object-contain drop-shadow-lg mix-blend-multiply transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div className="p-3">
        <p className="font-semibold text-xs leading-tight line-clamp-2 mb-2" style={{ color: '#264653' }}>{keychain.name}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm" style={{ color: '#2a80b9' }}>${keychain.price.toFixed(2)}</span>
          <button onClick={handleAdd}
            className="text-xs font-bold px-2.5 py-1 rounded-full text-white transition-all active:scale-90 shadow-sm"
            style={{ background: added ? '#22c55e' : '#2a80b9' }}>
            {added ? '✓' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
