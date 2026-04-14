import { useState, useEffect } from 'react';
import type { Sticker } from '../data/stickers';
import { useCart } from '../context/CartContext';

interface Props { stickers: Sticker[]; }

export default function FeaturedCarousel({ stickers }: Props) {
  const { addToCart } = useCart();
  const [current, setCurrent] = useState(0);
  const [added, setAdded] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!stickers.length) return;
    const t = setInterval(() => goTo((current + 1) % stickers.length), 4000);
    return () => clearInterval(t);
  }, [current, stickers.length]);

  const goTo = (idx: number) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 250);
  };

  if (!stickers.length) return null;
  const s = stickers[current];

  const handleAdd = () => {
    addToCart(s);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl animate-sparkle">⭐</span>
        <h2 className="font-display text-2xl" style={{ color: '#264653' }}>Featured Stickers</h2>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #2a80b9 0%, #1f6a9e 60%, #264653 100%)' }}>
        <div className="absolute top-4 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float-slow pointer-events-none" />
        <div className="absolute bottom-4 left-8 w-24 h-24 bg-white/10 rounded-full blur-xl animate-float pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-6 pt-10 pb-6 px-6 md:pt-12 md:pb-8 md:px-8 min-h-[200px]">
          {/* Sticker image on white card */}
          <div className={`flex-shrink-0 w-40 h-40 md:w-48 md:h-48 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden animate-float transition-opacity duration-250 ${fading ? 'opacity-0' : 'opacity-100'}`}>
            <img
              src={s.image}
              alt={s.name}
              className="max-w-full max-h-full object-contain p-3 drop-shadow-md mix-blend-multiply"
            />
          </div>

          {/* Info */}
          <div className={`flex-1 text-white transition-opacity duration-250 ${fading ? 'opacity-0' : 'opacity-100'}`}>
            <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
              ⭐ Featured Pick
            </span>
            <h3 className="font-display text-2xl md:text-3xl mb-2">{s.name}</h3>
            <p className="text-blue-100 text-sm mb-4">Hand-drawn & made with love 💕</p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-3xl font-bold">${s.price.toFixed(2)}</span>
              <button
                onClick={handleAdd}
                className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
                style={{ background: added ? '#22c55e' : 'white', color: added ? 'white' : '#2a80b9' }}
              >
                {added ? '✓ Added to cart!' : '🛒 Add to cart'}
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-3 right-6 flex gap-2">
            {stickers.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all ${i === current ? 'bg-white w-5 h-2' : 'bg-white/40 w-2 h-2'}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => goTo((current - 1 + stickers.length) % stickers.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all text-lg font-bold"
        >‹</button>
        <button
          onClick={() => goTo((current + 1) % stickers.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all text-lg font-bold"
        >›</button>
      </div>

    </section>
  );
}
