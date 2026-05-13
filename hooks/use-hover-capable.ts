'use client';

import { useSyncExternalStore } from 'react';

function subscribeHoverCapable(onChange: () => void) {
  const mq = window.matchMedia('(hover: hover)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getHoverCapableSnapshot() {
  return window.matchMedia('(hover: hover)').matches;
}

/** True when the primary input supports hover (typically fine pointer desktop). SSR: false. */
export function useHoverCapable(): boolean {
  return useSyncExternalStore(
    subscribeHoverCapable,
    getHoverCapableSnapshot,
    () => false
  );
}
