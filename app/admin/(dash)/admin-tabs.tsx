'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/admin', label: 'Home' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/seo', label: 'SEO' },
  { href: '/admin/rules', label: 'Rules' },
];

export default function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-7">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`py-4 text-base font-medium border-b-2 transition-colors ${
              active
                ? 'text-burgundy border-burgundy'
                : 'text-graphite border-transparent hover:text-charcoal'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
