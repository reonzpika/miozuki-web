'use client';

import { useEffect } from 'react';
import { captureAttributionOnLanding, refreshAttributionIdentifiers } from '@/lib/attribution';

/** Mounted once in the root layout. Runs on every page load; capture itself
 * is idempotent (see lib/attribution.ts) so re-mounts across navigation are
 * harmless. URL details are immediate; IDs refresh when the deferred tag loads. */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttributionOnLanding();
    const refresh = () => { void refreshAttributionIdentifiers(); };
    refresh();
    window.addEventListener('miozuki:analytics-ready', refresh);
    return () => window.removeEventListener('miozuki:analytics-ready', refresh);
  }, []);
  return null;
}
