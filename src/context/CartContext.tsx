import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Sticker } from '../data/stickers';

interface CartItem extends Sticker { qty: number; }
interface CartContextType {
  items: CartItem[];
  addToCart: (s: Sticker) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  total: number;
}

const CartContext = createContext<CartContextType>(null!);
export function useCart() { return useContext(CartContext); }

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (s: Sticker) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === s.id);
      if (exists) return prev.map(i => i.id === s.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...s, qty: 1 }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setItems([]);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isOpen, setIsOpen, total }}>
      {children}
    </CartContext.Provider>
  );
}
