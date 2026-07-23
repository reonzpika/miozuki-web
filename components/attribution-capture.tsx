'use client';

import { useEffect } from 'react';
import { captureAttributionOnLanding } from '@/lib/attribution';

/** Mounted once in the root layout. Runs on every page load; capture itself
 * is idempotent (see lib/attribution.ts) so re-mounts across navigation are
 * harmless. Deliberately independent of GA4/gtag loading — see lib/attribution.ts
 * header comment for why. */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttributionOnLanding();
  }, []);
  return null;
}
