// Reads GA4 numbers for the admin Analytics tab via the GA4 Data API.
// Credential-gated and graceful: if the service-account env vars are missing or
// an API call fails, each function returns null and the UI shows a "not
// connected yet" state instead of breaking. Same shape as lib/admin/vercel.ts.
//
// Period-aware: most functions take a Period ('7d' | '30d' | '90d') and compare
// the current window to the equal window before it for deltas. Report calls are
// wrapped in unstable_cache (5 min) keyed by period to keep loads fast and GA4
// quota low; the realtime "right now" figure is never cached.
//
// Env (set in .env.local and Vercel):
//   GA_PROPERTY_ID      the numeric GA4 property id, e.g. 523095453
//   GA_SA_CLIENT_EMAIL  the service-account email (granted Viewer on the property)
//   GA_SA_PRIVATE_KEY   the service-account private key (literal \n is fine)

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { unstable_cache } from 'next/cache';

export type Period = '7d' | '30d' | '90d';

export const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

export function asPeriod(v: string | undefined): Period {
  return v === '7d' || v === '90d' ? v : '30d';
}

const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 };

// Current window = last N days ending today. Previous = the N days before that.
function ranges(period: Period) {
  const d = PERIOD_DAYS[period];
  return {
    current: { startDate: `${d - 1}daysAgo`, endDate: 'today' },
    previous: { startDate: `${d * 2 - 1}daysAgo`, endDate: `${d}daysAgo` },
  };
}

let cachedClient: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient | null {
  const clientEmail = process.env.GA_SA_CLIENT_EMAIL;
  const rawKey = process.env.GA_SA_PRIVATE_KEY;
  if (!clientEmail || !rawKey) return null;
  if (cachedClient) return cachedClient;
  const privateKey = rawKey.replace(/\\n/g, '\n');
  cachedClient = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });
  return cachedClient;
}

function propertyPath(): string | null {
  const id = process.env.GA_PROPERTY_ID;
  return id ? `properties/${id}` : null;
}

// ---- shared types ----

export type Metric = { current: number; previous: number };

export type VisitorSummary = {
  visitors: Metric;
  pageViews: Metric;
};

export type SalesSnapshot = {
  purchases: Metric;
  revenue: Metric;
};

export type TrendPoint = { date: string; visitors: number };
export type Slice = { label: string; value: number };
export type TopPage = { title: string; path: string; views: number };
export type LandingPage = { path: string; sessions: number };
export type Channel = { name: string; sessions: number };

// ---- realtime (never cached) ----

export async function getLiveUsers(): Promise<number | null> {
  const client = getClient();
  const property = propertyPath();
  if (!client || !property) return null;
  try {
    const [res] = await client.runRealtimeReport({
      property,
      metrics: [{ name: 'activeUsers' }],
    });
    const value = res.rows?.[0]?.metricValues?.[0]?.value;
    return value === undefined ? 0 : Number(value);
  } catch {
    return null;
  }
}

// ---- current-vs-previous metric pair, for any list of metrics ----

async function pairTotals(
  metricNames: string[],
  period: Period,
): Promise<number[][] | null> {
  const client = getClient();
  const property = propertyPath();
  if (!client || !property) return null;
  try {
    const { current, previous } = ranges(period);
    const [res] = await client.runReport({
      property,
      dateRanges: [current, previous],
      metrics: metricNames.map((name) => ({ name })),
    });
    // Returns one row per date range with an auto "dateRange" dimension
    // (date_range_0 = current, date_range_1 = previous).
    const cur = metricNames.map(() => 0);
    const prev = metricNames.map(() => 0);
    for (const row of res.rows ?? []) {
      const which = row.dimensionValues?.[0]?.value;
      const target = which === 'date_range_1' ? prev : cur;
      (row.metricValues ?? []).forEach((m, i) => {
        target[i] = Number(m.value ?? 0);
      });
    }
    return [cur, prev];
  } catch {
    return null;
  }
}

export async function getVisitorSummary(
  period: Period,
): Promise<VisitorSummary | null> {
  return unstable_cache(
    async () => {
      const pair = await pairTotals(['activeUsers', 'screenPageViews'], period);
      if (!pair) return null;
      const [cur, prev] = pair;
      return {
        visitors: { current: cur[0], previous: prev[0] },
        pageViews: { current: cur[1], previous: prev[1] },
      };
    },
    ['ga-visitor-summary', period],
    { revalidate: 300 },
  )();
}

export async function getSalesSnapshot(
  period: Period,
): Promise<SalesSnapshot | null> {
  return unstable_cache(
    async () => {
      const pair = await pairTotals(['ecommercePurchases', 'totalRevenue'], period);
      if (!pair) return null;
      const [cur, prev] = pair;
      return {
        purchases: { current: cur[0], previous: prev[0] },
        revenue: { current: cur[1], previous: prev[1] },
      };
    },
    ['ga-sales-snapshot', period],
    { revalidate: 300 },
  )();
}

export async function getDailyTrend(period: Period): Promise<TrendPoint[] | null> {
  return unstable_cache(
    async () => {
      const client = getClient();
      const property = propertyPath();
      if (!client || !property) return null;
      try {
        const { current } = ranges(period);
        const [res] = await client.runReport({
          property,
          dateRanges: [current],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        });
        return (res.rows ?? []).map((r) => ({
          date: r.dimensionValues?.[0]?.value ?? '',
          visitors: Number(r.metricValues?.[0]?.value ?? 0),
        }));
      } catch {
        return null;
      }
    },
    ['ga-daily-trend', period],
    { revalidate: 300 },
  )();
}

async function sliceReport(
  dimension: string,
  period: Period,
  metric = 'activeUsers',
  limit = 10,
): Promise<Slice[] | null> {
  const client = getClient();
  const property = propertyPath();
  if (!client || !property) return null;
  try {
    const { current } = ranges(period);
    const [res] = await client.runReport({
      property,
      dateRanges: [current],
      dimensions: [{ name: dimension }],
      metrics: [{ name: metric }],
      orderBys: [{ metric: { metricName: metric }, desc: true }],
      limit,
    });
    return (res.rows ?? [])
      .map((r) => ({
        label: r.dimensionValues?.[0]?.value ?? '',
        value: Number(r.metricValues?.[0]?.value ?? 0),
      }))
      .filter((s) => s.label && s.label !== '(not set)');
  } catch {
    return null;
  }
}

export async function getDeviceBreakdown(period: Period): Promise<Slice[] | null> {
  return unstable_cache(
    () => sliceReport('deviceCategory', period),
    ['ga-devices', period],
    { revalidate: 300 },
  )();
}

export async function getNewVsReturning(period: Period): Promise<Slice[] | null> {
  return unstable_cache(
    () => sliceReport('newVsReturning', period),
    ['ga-new-returning', period],
    { revalidate: 300 },
  )();
}

export async function getTopPages(
  period: Period,
  limit = 8,
): Promise<TopPage[] | null> {
  return unstable_cache(
    async () => {
      const client = getClient();
      const property = propertyPath();
      if (!client || !property) return null;
      try {
        const { current } = ranges(period);
        const [res] = await client.runReport({
          property,
          dateRanges: [current],
          dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit,
        });
        return (res.rows ?? []).map((row) => ({
          title: row.dimensionValues?.[0]?.value ?? '',
          path: row.dimensionValues?.[1]?.value ?? '',
          views: Number(row.metricValues?.[0]?.value ?? 0),
        }));
      } catch {
        return null;
      }
    },
    ['ga-top-pages', period, String(limit)],
    { revalidate: 300 },
  )();
}

export async function getTopLandingPages(
  period: Period,
  limit = 6,
): Promise<LandingPage[] | null> {
  return unstable_cache(
    async () => {
      const slices = await sliceReport('landingPage', period, 'sessions', limit);
      if (!slices) return null;
      return slices.map((s) => ({ path: s.label, sessions: s.value }));
    },
    ['ga-landing-pages', period, String(limit)],
    { revalidate: 300 },
  )();
}

export async function getChannels(
  period: Period,
  limit = 6,
): Promise<Channel[] | null> {
  return unstable_cache(
    async () => {
      const slices = await sliceReport(
        'sessionDefaultChannelGroup',
        period,
        'sessions',
        limit,
      );
      if (!slices) return null;
      return slices.map((s) => ({ name: s.label, sessions: s.value }));
    },
    ['ga-channels', period, String(limit)],
    { revalidate: 300 },
  )();
}
