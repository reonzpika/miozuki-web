'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createCart, addCartLines, getCart, type CartAttribute } from '@/lib/shopify/cart';

const CART_ID_KEY = 'miozuki-cart-id';

interface CartContextValue {
  cartId: string | null;
  cartCount: number;
  addToCart: (variantId: string, quantity?: number, attributes?: CartAttribute[]) => Promise<void>;
  updateCartCount: (count: number) => void;
  checkoutUrl: string | null;
  setCheckoutUrl: (url: string) => void;
}

const CartContext = createContext<CartContextValue>({
  cartId: null,
  cartCount: 0,
  addToCart: async () => {},
  updateCartCount: () => {},
  checkoutUrl: null,
  setCheckoutUrl: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_ID_KEY);
    if (!stored) return;
    getCart(stored)
      .then((cart) => {
        if (cart) {
          setCartId(cart.id);
          setCartCount(cart.totalQuantity);
          setCheckoutUrl(cart.checkoutUrl);
        } else {
          localStorage.removeItem(CART_ID_KEY);
        }
      })
      .catch(() => localStorage.removeItem(CART_ID_KEY));
  }, []);

  const addToCart = useCallback(
    async (variantId: string, quantity = 1, attributes?: CartAttribute[]) => {
      let cart;
      if (cartId) {
        cart = await addCartLines(cartId, variantId, quantity, attributes);
      } else {
        cart = await createCart(variantId, quantity, attributes);
        localStorage.setItem(CART_ID_KEY, cart.id);
        setCartId(cart.id);
      }
      setCartCount(cart.totalQuantity);
      setCheckoutUrl(cart.checkoutUrl);
    },
    [cartId]
  );

  return (
    <CartContext.Provider value={{ cartId, cartCount, addToCart, updateCartCount: setCartCount, checkoutUrl, setCheckoutUrl }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
