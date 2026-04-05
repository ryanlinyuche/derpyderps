import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { isAdminLoggedIn } from '../data/stickers';

export default function Header() {
  const { items, setIsOpen } = useCart();
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const adminLoggedIn = isAdminLoggedIn();

  return (
    <header className="sticky top-0 z-50 border-b shadow-sm" style={{ background: 'rgba(222,241,255,0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(158,212,251,0.5)' }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="https://derpyderps.lovable.app/lovable-uploads/c57e8b4c-b683-4a4d-a0a0-da47904d7221.png"
            alt="Derpy Derps logo"
            className="w-9 h-9 rounded-full shadow group-hover:animate-wiggle transition-transform"
          />
          <span className="font-display text-xl group-hover:opacity-80 transition-opacity" style={{ color: '#264653' }}>
            Derpy Derps
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {adminLoggedIn ? (
            <Link
              to="/admin"
              className="text-sm font-semibold px-3 py-1.5 rounded-full transition-all"
              style={{ color: '#2a80b9', background: 'rgba(42,128,185,0.1)' }}
            >
              ⚙️ Admin
            </Link>
          ) : (
            <Link
              to="/admin"
              className="text-sm font-semibold transition-colors text-slate-400 hover:text-slate-600"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-1.5 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md transition-all active:scale-95"
            style={{ background: '#2a80b9' }}
          >
            🛒
            {totalQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-bounce-in font-bold">
                {totalQty}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
