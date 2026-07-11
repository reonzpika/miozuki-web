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
  const { cartId, cartCount, checkoutUrl, updateCartCount, setCheckoutUrl } = useCart();
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
      updateCartCount(updated.totalQuantity);
      setCheckoutUrl(updated.checkoutUrl);
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
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-charcoal/50 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream -mr-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
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
                type="button"
                onClick={onClose}
                className="min-h-11 px-4 text-xs tracking-widest uppercase text-burgundy transition-colors hover:text-burgundy/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
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
                      type="button"
                      onClick={() => handleRemove(line.id)}
                      disabled={removing === line.id}
                      className="inline-flex min-h-11 min-w-[4.5rem] shrink-0 items-center justify-center px-2 text-xs text-charcoal/40 transition-colors hover:text-charcoal/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm disabled:opacity-50"
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
          <div className="mt-auto border-t border-charcoal/8 bg-cream px-6 pt-6 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal/60">Subtotal</span>
              <span className="text-charcoal font-medium">
                {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
              </span>
            </div>
            <p className="text-xs text-charcoal/40">
              Shipping and taxes calculated at checkout. We ship to NZ and
              Australia; AU orders are charged in AUD at checkout.
            </p>
            {parseFloat(cart.cost.subtotalAmount.amount) >= 1000 && (
              <p className="text-xs leading-relaxed text-charcoal/55">
                Shipping to Australia? Parcels totalling over about AUD $1,000
                may attract Australian GST and duty on delivery. Under that,
                there are no extra border charges.
              </p>
            )}
            <a
              href={checkoutUrl ?? '#'}
              className="block w-full text-center bg-burgundy text-cream py-4 text-xs tracking-[0.2em] uppercase transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
