import { getStoredAttributionAttributes, refreshAttributionIdentifiers } from './attribution';
import { updateCartAttributes } from './shopify/cart';

/** Attribution is awaited briefly, but a tracking failure cannot prevent a sale. */
export async function persistCartAttribution(cartId: string): Promise<void> {
  try {
    await refreshAttributionIdentifiers();
    const attributes = getStoredAttributionAttributes();
    if (!attributes.length) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        updateCartAttributes(cartId, attributes),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('Attribution write timed out')), 1200);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  } catch {
    // No identifiers or customer details in diagnostics.
    console.warn('Cart attribution was not confirmed before checkout; shopping remains available.');
  }
}
