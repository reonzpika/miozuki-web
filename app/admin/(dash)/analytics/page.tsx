import {
  getLiveUsers,
  getVisitorSummary,
  getSalesTotals,
  getDailyTrend,
  getDeviceBreakdown,
  getNewVsReturning,
  getTopPages,
  getTopLandingPages,
  getChannels,
  asPeriod,
  PERIODS,
  type Period,
  type Metric,
} from '@/lib/admin/analytics';
import { VisitorTrendChart } from '@/components/admin/charts/visitor-trend-chart';
import { DonutChart } from '@/components/admin/charts/donut-chart';
import { ChannelsTable, TopPagesTable } from '@/components/admin/tables';

export const dynamic = 'force-dynamic';

const GA4_LINK =
  'https://analytics.google.com/analytics/web/#/a383243922p523095453/reports/intelligenthome';
const META_EVENTS_LINK =
  'https://www.facebook.com/events_manager2/list/pixel/1431947621104249';
const SHOPIFY_ANALYTICS_LINK =
  'https://admin.shopify.com/store/nassuu-px/analytics';

const num = new Intl.NumberFormat('en-NZ');
const money = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  maximumFractionDigits: 0,
});

const PERIOD_LABEL: Record<Period, string> = {
  '7d': 'last 7 days',
  '30d': 'last 30 days',
  '90d': 'last 90 days',
};

function Delta({ m }: { m: Metric }) {
  if (!m.previous) return null;
  const pct = Math.round(((m.current - m.previous) / m.previous) * 100);
  if (pct === 0) return <span className="text-[14px] text-graphite">no change</span>;
  const up = pct > 0;
  return (
    <span className={`text-[14px] font-medium ${up ? 'text-[#3f7d52]' : 'text-burgundy'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

function StatTile({
  label,
  value,
  m,
  sub,
}: {
  label: string;
  value: string;
  m?: Metric;
  sub: string;
}) {
  return (
    <div className="bg-white-soft border border-border rounded-xl p-5">
      <div className="text-[13px] font-medium tracking-wide uppercase text-graphite mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl text-charcoal">{value}</span>
        {m ? <Delta m={m} /> : null}
      </div>
      <div className="text-[15px] text-graphite mt-1">{sub}</div>
    </div>
  );
}

function shortPath(path: string): string {
  return path || '/';
}

export default async function AdminAnalytics({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: raw } = await searchParams;
  const period = asPeriod(raw);
  const periodLabel = PERIOD_LABEL[period];

  const [live, summary, sales, trend, devices, newReturning, topPages, landing, channels] =
    await Promise.all([
      getLiveUsers(),
      getVisitorSummary(period),
      getSalesTotals(),
      getDailyTrend(period),
      getDeviceBreakdown(period),
      getNewVsReturning(period),
      getTopPages(period),
      getTopLandingPages(period),
      getChannels(period),
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
              ? `${num.format(live)} ${live === 1 ? 'visitor' : 'visitors'} on the site right now`
              : 'Your visitor numbers'}
          </h1>
          <p className="text-graphite text-base sm:text-[17px] mt-0.5">
            {connected
              ? 'Live from Google Analytics. These update each time you open this page.'
              : 'Almost ready. There is nothing for you to do; see the note below.'}
          </p>
        </div>
      </section>

      {!connected ? (
        <section className="rounded-xl border border-dashed border-border bg-cream/60 p-6 mb-6">
          <span className="inline-block text-[13px] font-medium tracking-wide uppercase text-graphite border border-border rounded-full px-2.5 py-0.5 mb-2">
            Almost ready
          </span>
          <h2 className="font-serif text-xl text-charcoal">Not switched on yet</h2>
          <p className="text-base text-graphite">
            The visitor numbers will appear here once the Google Analytics connection is
            finished. Nothing for you to do, Ryo is setting it up.
          </p>
        </section>
      ) : (
        <>
          {/* Period toggle */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[15px] text-graphite mr-1">Showing:</span>
            {PERIODS.map((p) => {
              const active = p.value === period;
              return (
                <a
                  key={p.value}
                  href={`/admin/analytics?period=${p.value}`}
                  className={`text-[15px] font-medium px-4 py-1.5 rounded-full border transition-colors ${
                    active
                      ? 'bg-burgundy text-white-soft border-burgundy'
                      : 'border-border text-charcoal hover:bg-cream'
                  }`}
                >
                  {p.label}
                </a>
              );
            })}
          </div>

          {/* Headline tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatTile
              label="Visitors"
              value={summary ? num.format(summary.visitors.current) : '—'}
              m={summary?.visitors}
              sub={`vs the ${periodLabel.replace('last ', 'previous ')}`}
            />
            <StatTile
              label="Page views"
              value={summary ? num.format(summary.pageViews.current) : '—'}
              m={summary?.pageViews}
              sub="pages opened"
            />
            <StatTile
              label="Total orders"
              value={sales ? num.format(sales.purchases) : '—'}
              sub="all time"
            />
            <StatTile
              label="Total revenue"
              value={sales ? money.format(sales.revenue) : '—'}
              sub="all time"
            />
          </div>

          {/* Trend */}
          <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="font-serif text-xl text-charcoal">Visitors per day</h2>
              <span className="text-[15px] text-graphite">{periodLabel}</span>
            </div>
            {trend ? (
              <div className="mt-3">
                <VisitorTrendChart data={trend} />
              </div>
            ) : (
              <p className="text-base text-graphite">Not connected yet.</p>
            )}
          </section>

          {/* Audience cuts */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <section className="bg-white-soft border border-border rounded-xl p-6">
              <h2 className="font-serif text-xl text-charcoal mb-4">What they browse on</h2>
              {devices && devices.length > 0 ? (
                <DonutChart data={devices} unit="visitors" />
              ) : (
                <p className="text-base text-graphite">No data yet.</p>
              )}
            </section>
            <section className="bg-white-soft border border-border rounded-xl p-6">
              <h2 className="font-serif text-xl text-charcoal mb-4">New vs returning</h2>
              {newReturning && newReturning.length > 0 ? (
                <DonutChart data={newReturning} unit="visitors" />
              ) : (
                <p className="text-base text-graphite">No data yet.</p>
              )}
            </section>
          </div>

          {/* Top pages */}
          <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
            <h2 className="font-serif text-xl text-charcoal">Most viewed pages</h2>
            <p className="text-base text-graphite mb-4">Over the {periodLabel}.</p>
            {topPages && topPages.length > 0 ? (
              <TopPagesTable data={topPages} />
            ) : (
              <p className="text-base text-graphite">No page views recorded yet.</p>
            )}
          </section>

          {/* Sources + landing pages */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <section className="bg-white-soft border border-border rounded-xl p-6">
              <h2 className="font-serif text-xl text-charcoal mb-4">Where visitors come from</h2>
              {channels && channels.length > 0 ? (
                <ChannelsTable data={channels} />
              ) : (
                <p className="text-base text-graphite">No data yet.</p>
              )}
            </section>
            <section className="bg-white-soft border border-border rounded-xl p-6">
              <h2 className="font-serif text-xl text-charcoal mb-4">Pages they arrive on</h2>
              {landing && landing.length > 0 ? (
                <ul>
                  {landing.map((p) => (
                    <li
                      key={p.path}
                      className="flex items-center gap-4 py-2.5 border-b border-border last:border-b-0"
                    >
                      <span className="flex-1 font-mono text-[14px] text-charcoal truncate">
                        {shortPath(p.path)}
                      </span>
                      <span className="flex-none text-base text-graphite">
                        {num.format(p.sessions)} visits
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-graphite">No data yet.</p>
              )}
            </section>
          </div>
        </>
      )}

      {/* Full-report links */}
      <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
        <h2 className="font-serif text-xl text-charcoal">Open the full reports</h2>
        <p className="text-base text-graphite mb-4">
          For more detail than this page shows. These open in Google and Shopify and may ask you
          to sign in.
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
