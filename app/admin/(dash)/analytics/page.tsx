import {
  getLiveUsers,
  getVisitorSummary,
  getTopPages,
  getChannels,
} from '@/lib/admin/analytics';

export const dynamic = 'force-dynamic';

// Full-report links for when more detail than this page shows is wanted.
const GA4_LINK =
  'https://analytics.google.com/analytics/web/#/a383243922p523095453/reports/intelligenthome';
const META_EVENTS_LINK =
  'https://www.facebook.com/events_manager2/list/pixel/1431947621104249';
const SHOPIFY_ANALYTICS_LINK =
  'https://admin.shopify.com/store/nassuu-px/analytics';

function fmt(n: number): string {
  return n.toLocaleString('en-NZ');
}

export default async function AdminAnalytics() {
  const [live, summary, topPages, channels] = await Promise.all([
    getLiveUsers(),
    getVisitorSummary(),
    getTopPages(),
    getChannels(),
  ]);

  const connected = live !== null || summary !== null;

  return (
    <div>
      {/* Hero: visitors right now */}
      <section className="rounded-2xl border border-border p-7 sm:p-8 mb-6 flex items-center gap-5 bg-gradient-to-br from-[#fbf7f1] to-blush">
        <div
          className={`flex-none w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl ${
            connected ? 'bg-[#3f7d52]' : 'bg-[#b8860b]'
          }`}
          aria-hidden
        >
          {connected ? '●' : '!'}
        </div>
        <div>
          <h1 className="font-serif text-3xl sm:text-[30px] text-charcoal">
            {live !== null
              ? `${fmt(live)} ${live === 1 ? 'visitor' : 'visitors'} on the site right now`
              : 'Your visitor numbers'}
          </h1>
          <p className="text-graphite text-base sm:text-[17px] mt-0.5">
            {connected
              ? 'Live from Google Analytics. These update each time you open this page.'
              : 'Almost ready. There is nothing for you to do; see the note below.'}
          </p>
        </div>
      </section>

      {!connected && (
        <section className="rounded-xl border border-dashed border-border bg-cream/60 p-6 mb-6">
          <span className="inline-block text-[13px] font-medium tracking-wide uppercase text-graphite border border-border rounded-full px-2.5 py-0.5 mb-2">
            Almost ready
          </span>
          <h2 className="font-serif text-xl text-charcoal">Not switched on yet</h2>
          <p className="text-base text-graphite">
            The visitor numbers will appear here once the Google Analytics
            connection is finished. Nothing for you to do, Ryo is setting it up.
          </p>
        </section>
      )}

      {/* Visitor tiles */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-7">
        <StatTile
          label="Today"
          value={summary ? fmt(summary.today) : '—'}
          sub="visitors so far"
        />
        <StatTile
          label="Last 7 days"
          value={summary ? fmt(summary.last7) : '—'}
          sub="visitors"
        />
        <StatTile
          label="Last 30 days"
          value={summary ? fmt(summary.last30) : '—'}
          sub="visitors"
        />
      </div>

      {/* Most viewed pages */}
      <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
        <h2 className="font-serif text-xl text-charcoal">Most viewed pages</h2>
        <p className="text-base text-graphite mb-4">Over the last 7 days.</p>
        {topPages && topPages.length > 0 ? (
          <ul>
            {topPages.map((p) => (
              <li
                key={p.path}
                className="flex items-center gap-4 py-3 border-b border-border last:border-b-0"
              >
                <span className="flex-1 text-base text-charcoal truncate">
                  {p.title || p.path}
                </span>
                <span className="flex-none text-base text-graphite">
                  {fmt(p.views)} views
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-graphite">
            {topPages === null
              ? 'Not connected yet.'
              : 'No page views recorded yet.'}
          </p>
        )}
      </section>

      {/* Where visitors come from */}
      <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
        <h2 className="font-serif text-xl text-charcoal">
          Where visitors come from
        </h2>
        <p className="text-base text-graphite mb-4">Over the last 7 days.</p>
        {channels && channels.length > 0 ? (
          <ul>
            {channels.map((c) => (
              <li
                key={c.name}
                className="flex items-center gap-4 py-3 border-b border-border last:border-b-0"
              >
                <span className="flex-1 text-base text-charcoal">{c.name}</span>
                <span className="flex-none text-base text-graphite">
                  {fmt(c.sessions)} visits
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-graphite">
            {channels === null
              ? 'Not connected yet.'
              : 'No visits recorded yet.'}
          </p>
        )}
      </section>

      {/* Full-report links */}
      <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
        <h2 className="font-serif text-xl text-charcoal">Open the full reports</h2>
        <p className="text-base text-graphite mb-4">
          For more detail than this page shows. These open in Google and Shopify
          and may ask you to sign in.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={GA4_LINK}
            target="_blank"
            rel="noreferrer"
            className="text-base font-medium px-5 py-2.5 rounded-lg border border-burgundy text-burgundy hover:bg-blush transition-colors"
          >
            Google Analytics
          </a>
          <a
            href={META_EVENTS_LINK}
            target="_blank"
            rel="noreferrer"
            className="text-base font-medium px-5 py-2.5 rounded-lg border border-border text-charcoal hover:bg-cream transition-colors"
          >
            Meta Events Manager
          </a>
          <a
            href={SHOPIFY_ANALYTICS_LINK}
            target="_blank"
            rel="noreferrer"
            className="text-base font-medium px-5 py-2.5 rounded-lg border border-border text-charcoal hover:bg-cream transition-colors"
          >
            Shopify Analytics
          </a>
        </div>
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white-soft border border-border rounded-xl p-5">
      <div className="text-[13px] font-medium tracking-wide uppercase text-graphite mb-2">
        {label}
      </div>
      <div className="font-serif text-3xl text-charcoal">{value}</div>
      <div className="text-[15px] text-graphite mt-1">{sub}</div>
    </div>
  );
}
