import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartProduct } from '../data/stickers';

interface CartItem extends CartProduct { qty: number; }
interface CartContextType {
  items: CartItem[];
  addToCart: (p: CartProduct) => void;
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

  const addToCart = (p: CartProduct) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === p.id);
      if (exists) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
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
