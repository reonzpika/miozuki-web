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
      let storedId: string | null = null;
      try {
        storedId = localStorage.getItem(CART_ID_KEY);
      } catch {
        storedId = null;
      }
      const effectiveCartId = cartId ?? storedId;

      let cart: Awaited<ReturnType<typeof createCart>>;
      try {
        if (effectiveCartId) {
          cart = await addCartLines(effectiveCartId, variantId, quantity, attributes);
        } else {
          cart = await createCart(variantId, quantity, attributes);
        }
      } catch (firstError) {
        if (effectiveCartId) {
          try {
            localStorage.removeItem(CART_ID_KEY);
          } catch {
            /* ignore */
          }
          setCartId(null);
          cart = await createCart(variantId, quantity, attributes);
        } else {
          throw firstError;
        }
      }

      try {
        localStorage.setItem(CART_ID_KEY, cart.id);
      } catch {
        /* ignore */
      }
      setCartId(cart.id);
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
