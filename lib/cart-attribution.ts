import { ATTRIBUTION_ATTRIBUTE_KEYS, getStoredAttributionAttributes, refreshAttributionIdentifiers } from './attribution';
import { getCart, updateCartAttributes, type Cart } from './shopify/cart';

const pending = new Map<string, Promise<Cart | undefined>>();
/** Confirm the persisted cart without indefinitely holding up a sale. */
export async function persistCartAttribution(cartId: string): Promise<Cart | undefined> {
  let timer: ReturnType<typeof setTimeout>;
  const deadline = new Promise<undefined>(resolve => { timer = setTimeout(() => resolve(undefined), 1800); });
  const prior = pending.get(cartId);
  const write = async () => {
    try {
      if (prior) await prior;
      await refreshAttributionIdentifiers();
      const readController = new AbortController();
      let readTimer: ReturnType<typeof setTimeout>;
      let current: Cart | null | undefined;
      try {
        current = await Promise.race([getCart(cartId, readController.signal), new Promise<undefined>(resolve => {
          readTimer = setTimeout(() => { readController.abort(); resolve(undefined); }, 8000);
        })]);
      } finally { clearTimeout(readTimer!); }
      if (!current) return undefined;
      const attributes = getStoredAttributionAttributes();
      const owned = new Set<string>(ATTRIBUTION_ATTRIBUTE_KEYS);
      const preserved = (current.attributes ?? []).filter(attribute => !owned.has(attribute.key));
      // The caller's checkout deadline must not release a write lock early:
      // aborting a browser request does not cancel Shopify's mutation.
      const updated = await updateCartAttributes(cartId, [...preserved, ...attributes]);
      if (!updated.attributes) throw new Error('Cart attributes unavailable');
      const actual = new Map(updated.attributes.map(attribute => [attribute.key, attribute.value]));
      if (attributes.some(attribute => (actual.get(attribute.key) ?? '') !== attribute.value)) throw new Error('Cart attributes did not match');
      return updated;
    } catch {
      console.warn('Cart attribution was not confirmed; shopping remains available.');
      return undefined;
    }
  };
  const operation: Promise<Cart | undefined> = (async () => {
    try {
      return typeof navigator !== 'undefined' && navigator.locks
        ? await navigator.locks.request('miozuki-attribution:' + cartId, write)
        : await write();
    } catch { return undefined; }
  })();
  pending.set(cartId, operation);
  try {
    return await Promise.race([
      operation,
      deadline,
    ]);
  } finally {
    clearTimeout(timer!);
    void operation.finally(() => { if (pending.get(cartId) === operation) pending.delete(cartId); });
  }
}
