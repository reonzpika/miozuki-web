'use client';

import { usePathname } from 'next/navigation';

/**
 * Renders the storefront chrome (announcement bar, header, footer, popups) on
 * every route EXCEPT the /admin dashboard, which has its own shell. Keeps the
 * public storefront completely untouched: on any non-admin route this just
 * renders its children as-is.
 */
export default function StorefrontChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <>{children}</>;
}
