'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createCart, addCartLines, getCart, type CartAttribute } from '@/lib/shopify/cart';
import { persistCartAttribution } from '@/lib/cart-attribution';
import { subscribeToPrivacy } from '@/lib/tracking-privacy';

const CART_ID_KEY = 'miozuki-cart-id';

interface CartContextValue {
  cartId: string | null;
  cartCount: number;
  addToCart: (variantId: string, quantity?: number, attributes?: CartAttribute[]) => Promise<void>;
  updateCartCount: (count: number) => void;
  checkoutUrl: string | null;
  setCheckoutUrl: (url: string) => void;
  prepareCheckout: () => Promise<string | null>;
}

const CartContext = createContext<CartContextValue>({
  cartId: null,
  cartCount: 0,
  addToCart: async () => {},
  updateCartCount: () => {},
  checkoutUrl: null,
  setCheckoutUrl: () => {},
  prepareCheckout: async () => null,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    let stored: string | null;
    try { stored = localStorage.getItem(CART_ID_KEY); } catch { return; }
    if (!stored) return;
    getCart(stored)
      .then((cart) => {
        if (cart) {
          setCartId(cart.id);
          setCartCount(cart.totalQuantity);
          setCheckoutUrl(cart.checkoutUrl);
        } else {
          try { localStorage.removeItem(CART_ID_KEY); } catch { /* storage unavailable */ }
        }
      })
      .catch(() => { /* A transient failure does not prove the basket expired. */ });
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
        if (effectiveCartId && await getCart(effectiveCartId).then(cart => cart === null).catch(() => false)) {
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

      const confirmed = await persistCartAttribution(cart.id);
      if (confirmed) setCheckoutUrl(confirmed.checkoutUrl);
    },
    [cartId]
  );

  const prepareCheckout = useCallback(async () => {
    const confirmed = cartId ? await persistCartAttribution(cartId) : undefined;
    if (confirmed) setCheckoutUrl(confirmed.checkoutUrl);
    return confirmed?.checkoutUrl ?? checkoutUrl;
  }, [cartId, checkoutUrl]);

  useEffect(() => subscribeToPrivacy(() => {
    if (cartId) void persistCartAttribution(cartId);
  }), [cartId]);

  return (
    <CartContext.Provider value={{ cartId, cartCount, addToCart, updateCartCount: setCartCount, checkoutUrl, setCheckoutUrl, prepareCheckout }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
