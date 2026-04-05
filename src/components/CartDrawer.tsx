import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, removeFromCart, clearCart, isOpen, setIsOpen, total } = useCart();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ background: '#DEF1FF', borderColor: '#9ED4FB' }}>
          <h2 className="font-display text-lg" style={{ color: '#264653' }}>🛒 Your Cart</h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🦆</div>
              <p className="text-slate-400 font-medium">No stickers yet!</p>
              <p className="text-slate-400 text-sm">Add some derpy ducks to get started.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: '#DEF1FF' }}>
                <img src={item.image} alt={item.name} className="w-14 h-14 object-contain rounded-lg bg-white mix-blend-multiply" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#264653' }}>{item.name}</p>
                  <p className="text-sm font-bold" style={{ color: '#2a80b9' }}>${(item.price * item.qty).toFixed(2)}</p>
                  <p className="text-slate-400 text-xs">Qty: {item.qty} × ${item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-lg transition-colors">🗑️</button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-between font-bold text-lg" style={{ color: '#264653' }}>
              <span>Total</span>
              <span style={{ color: '#2a80b9' }}>${total.toFixed(2)}</span>
            </div>
            <button
              className="w-full text-white py-3 rounded-xl font-bold text-base shadow-lg transition-all active:scale-95"
              style={{ background: '#2a80b9' }}
            >
              Checkout ✨
            </button>
            <button onClick={clearCart} className="w-full text-sm text-slate-400 hover:text-red-500 transition-colors">
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
