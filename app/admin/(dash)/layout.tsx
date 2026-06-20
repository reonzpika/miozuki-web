import AdminTabs from './admin-tabs';

export const metadata = { title: 'Miozuki admin', robots: { index: false } };

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white-soft border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl text-burgundy">Miozuki</span>
            <span className="text-[13px] tracking-[0.2em] uppercase text-graphite">
              admin
            </span>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="text-base text-graphite hover:text-burgundy transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
        <div className="max-w-5xl mx-auto px-6">
          <AdminTabs />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-9">{children}</main>
    </div>
  );
}
