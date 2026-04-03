'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './cart-provider';
import { getCart, removeCartLines } from '@/lib/shopify/cart';
import type { Cart } from '@/lib/shopify/cart';

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { cartId, cartCount, checkoutUrl } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fetch cart when drawer opens
  useEffect(() => {
    if (!open || !cartId) return;
    getCart(cartId).then(setCart).catch(() => {});
  }, [open, cartId, cartCount]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleRemove = async (lineId: string) => {
    if (!cartId) return;
    setRemoving(lineId);
    try {
      const updated = await removeCartLines(cartId, [lineId]);
      setCart(updated);
    } finally {
      setRemoving(null);
    }
  };

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className={`fixed inset-0 bg-charcoal/30 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-cream z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal/8">
          <h2 className="font-serif text-lg text-charcoal">Your Cart</h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="text-charcoal/50 hover:text-charcoal transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-charcoal/40 text-sm">Your cart is empty.</p>
              <button
                onClick={onClose}
                className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="flex gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-cream/60 overflow-hidden">
                  {line.merchandise.product.featuredImage ? (
                    <Image
                      src={line.merchandise.product.featuredImage.url}
                      alt={line.merchandise.product.featuredImage.altText ?? line.merchandise.product.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-charcoal/20 text-xs">M</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    onClick={onClose}
                    className="text-sm text-charcoal leading-snug hover:text-burgundy transition-colors line-clamp-2"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  {line.merchandise.title !== 'Default Title' && (
                    <p className="text-xs text-charcoal/40 mt-0.5">
                      {line.merchandise.title}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-burgundy font-medium">
                      {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                      {line.quantity > 1 && (
                        <span className="text-charcoal/40 text-xs ml-1">×{line.quantity}</span>
                      )}
                    </p>
                    <button
                      onClick={() => handleRemove(line.id)}
                      disabled={removing === line.id}
                      className="text-charcoal/30 hover:text-charcoal/60 transition-colors text-xs"
                      aria-label="Remove item"
                    >
                      {removing === line.id ? '…' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && cart && (
          <div className="border-t border-charcoal/8 px-6 py-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal/60">Subtotal</span>
              <span className="text-charcoal font-medium">
                {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
              </span>
            </div>
            <p className="text-xs text-charcoal/40">
              Shipping and taxes calculated at checkout.
            </p>
            <a
              href={checkoutUrl ?? '#'}
              className="block w-full text-center bg-burgundy text-cream py-4 text-xs tracking-[0.2em] uppercase hover:bg-burgundy/90 transition-colors"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
