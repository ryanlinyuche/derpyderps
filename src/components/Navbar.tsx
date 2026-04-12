import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { isAdminLoggedIn } from '../data/stickers';
import { useState } from 'react';

export default function Navbar() {
  const { items, setIsOpen } = useCart();
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const adminLoggedIn = isAdminLoggedIn();
  const { categories } = useData();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeCategory = pathname.startsWith('/category/')
    ? pathname.replace('/category/', '')
    : null;

  return (
    <header className="sticky top-0 z-50 shadow-sm" style={{ background: 'rgba(222,241,255,0.95)', backdropFilter: 'blur(14px)' }}>
      {/* ── Row 1: Logo · links · cart ── */}
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img
            src="https://derpyderps.lovable.app/lovable-uploads/c57e8b4c-b683-4a4d-a0a0-da47904d7221.png"
            alt="Derpy Derps"
            className="w-11 h-11 rounded-full shadow group-hover:animate-wiggle"
          />
          <span className="font-display text-2xl hidden sm:block" style={{ color: '#264653' }}>
            Derpy Derps
          </span>
        </Link>

        {/* Right controls */}
        <nav className="flex items-center gap-2">
          <Link
            to="/about"
            className="hidden sm:block text-sm font-semibold px-3 py-1.5 rounded-full transition-all"
            style={{ color: pathname === '/about' ? '#2a80b9' : '#264653', background: pathname === '/about' ? 'rgba(42,128,185,0.1)' : 'transparent' }}
          >
            About Us
          </Link>

          {adminLoggedIn ? (
            <Link
              to="/admin"
              className="hidden sm:block text-sm font-semibold px-3 py-1.5 rounded-full transition-all"
              style={{ color: '#2a80b9', background: 'rgba(42,128,185,0.1)' }}
            >
              ⚙️ Admin
            </Link>
          ) : (
            <Link to="/admin" className="hidden sm:block text-xs text-slate-400 hover:text-slate-600 px-2 transition-colors">
              Admin
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-1 text-white pl-3 pr-4 py-2 rounded-full font-semibold text-sm shadow-md transition-all active:scale-95"
            style={{ background: '#2a80b9' }}
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {totalQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-bounce-in font-bold">
                {totalQty}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#264653' }}
            onClick={() => setMenuOpen(v => !v)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </nav>
      </div>

      {/* ── Row 2: Category strip ── */}
      <div className="border-t overflow-x-auto scrollbar-hide" style={{ borderColor: 'rgba(158,212,251,0.6)' }}>
        <div className="flex items-center gap-2 px-5 py-2.5 min-w-max max-w-6xl mx-auto">
          {/* "All" pill */}
          <Link
            to="/"
            className="flex-shrink-0 text-sm font-bold px-5 py-2 rounded-full transition-all whitespace-nowrap"
            style={{
              background: !activeCategory && pathname === '/' ? '#2a80b9' : 'transparent',
              color: !activeCategory && pathname === '/' ? 'white' : '#264653',
              border: !activeCategory && pathname === '/' ? 'none' : '1px solid rgba(42,128,185,0.25)',
            }}
          >
            ✦ All
          </Link>

          {categories.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="flex-shrink-0 flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-full transition-all whitespace-nowrap"
                style={{
                  background: active ? '#2a80b9' : 'transparent',
                  color: active ? 'white' : '#264653',
                  border: active ? 'none' : '1px solid rgba(42,128,185,0.25)',
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            );
          })}

          {/* Keychains link */}
          <Link
            to="/keychains"
            className="flex-shrink-0 flex items-center gap-1.5 text-sm font-bold px-5 py-2 rounded-full transition-all whitespace-nowrap"
            style={{
              background: pathname === '/keychains' || pathname.startsWith('/keychain/') ? '#2a80b9' : 'transparent',
              color: pathname === '/keychains' || pathname.startsWith('/keychain/') ? 'white' : '#264653',
              border: pathname === '/keychains' || pathname.startsWith('/keychain/') ? 'none' : '1px solid rgba(42,128,185,0.25)',
            }}
          >
            <span>🔑</span>
            <span>Keychains</span>
          </Link>

          <Link
            to="/about"
            className="flex-shrink-0 text-sm font-semibold px-4 py-1.5 rounded-full transition-all whitespace-nowrap sm:hidden"
            style={{
              background: pathname === '/about' ? '#2a80b9' : 'transparent',
              color: pathname === '/about' ? 'white' : '#264653',
              border: pathname === '/about' ? 'none' : '1px solid rgba(42,128,185,0.25)',
            }}
          >
            About Us
          </Link>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t px-4 py-3 space-y-1" style={{ background: '#DEF1FF', borderColor: 'rgba(158,212,251,0.6)' }}>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold py-2 px-3 rounded-lg" style={{ color: '#264653' }}>About Us</Link>
          {adminLoggedIn && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold py-2 px-3 rounded-lg" style={{ color: '#2a80b9' }}>⚙️ Admin</Link>
          )}
        </div>
      )}
    </header>
  );
}
