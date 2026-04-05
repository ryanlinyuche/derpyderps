import { useState } from 'react';
import { Sticker } from '../data/stickers';
import { useCart } from '../context/CartContext';
import { useInView } from '../hooks/useInView';

interface Props {
  sticker: Sticker;
  index?: number;
}

export default function StickerCard({ sticker, index = 0 }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { ref, inView } = useInView(0.1);

  // Stagger capped at 5 to avoid long waits in large grids
  const delay = Math.min(index % 6, 5) * 75;

  const handleAdd = () => {
    addToCart(sticker);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(36px) scale(0.97)',
        transition: `opacity 0.55s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-shadow duration-300 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative flex items-center justify-center p-4 h-44 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #DEF1FF 0%, rgba(158,212,251,0.2) 100%)' }}
      >
        <img
          src={sticker.image}
          alt={sticker.name}
          className={`max-h-36 max-w-full object-contain drop-shadow-lg mix-blend-multiply transition-transform duration-300 ${hovered ? 'scale-110' : 'scale-100'}`}
        />
        {sticker.featured && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
            ⭐ Featured
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2" style={{ color: '#264653' }}>
          {sticker.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-base" style={{ color: '#2a80b9' }}>${sticker.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-90 shadow-sm text-white"
            style={{ background: added ? '#22c55e' : '#2a80b9' }}
          >
            {added ? '✓ Added!' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
