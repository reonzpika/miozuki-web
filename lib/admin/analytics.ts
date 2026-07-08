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
//   GA_SA_CLIENT_EMAIL  optional service-account email for deployed envs
//   GA_SA_PRIVATE_KEY   optional service-account private key (literal \n is fine)
// If service-account credentials are absent, the client falls back to Google
// Application Default Credentials. This lets local development use
// `gcloud auth application-default login` without a downloadable key.

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

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

let cachedClient: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient | null {
  const clientEmail = process.env.GA_SA_CLIENT_EMAIL;
  const rawKey = process.env.GA_SA_PRIVATE_KEY;
  if (cachedClient) return cachedClient;
  if (!clientEmail || !rawKey) {
    cachedClient = new BetaAnalyticsDataClient();
    return cachedClient;
  }
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

export type SalesTotals = {
  purchases: number;
  revenue: number;
};

// Two real orders placed before GA tracking was trusted, hardcoded as the
// all-time baseline: Shopify #1001 (5 Mar 2026, $466) and #1002 (1 May 2026,
// $443). GA counts orders from SALES_START_DATE onward, which is after these,
// so adding the baseline does not double-count. Update here if older orders surface.
const SALES_BASELINE: SalesTotals = { purchases: 2, revenue: 909 };

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

// All-time sales: the hardcoded baseline (the two pre-tracking real orders) plus
// every order GA records from SALES_START_DATE (YYYY-MM-DD) onward. The clamp keeps
// the historical test-mode checkouts out, and because the baseline orders predate
// the clamp they are not double-counted.
export async function getSalesTotals(): Promise<SalesTotals | null> {
  const salesStart = process.env.SALES_START_DATE || '';
  return unstable_cache(
    async () => {
      const client = getClient();
      const property = propertyPath();
      if (!client || !property) return null;
      try {
        const start = salesStart || '2020-01-01';
        const [res] = await client.runReport({
          property,
          dateRanges: [{ startDate: start, endDate: ymd(new Date()) }],
          metrics: [{ name: 'ecommercePurchases' }, { name: 'totalRevenue' }],
        });
        const row = res.rows?.[0];
        const gaPurchases = Number(row?.metricValues?.[0]?.value ?? 0);
        const gaRevenue = Number(row?.metricValues?.[1]?.value ?? 0);
        return {
          purchases: SALES_BASELINE.purchases + gaPurchases,
          revenue: SALES_BASELINE.revenue + gaRevenue,
        };
      } catch {
        return null;
      }
    },
    ['ga-sales-totals', salesStart],
    { revalidate: 300 },
  )();
}

export type WeeklySales = { orders: number; revenue: number };

/** Orders + revenue GA4 recorded in the last 7 days (the digest's "this week").
 *  No baseline: this is strictly the current week, which reads 0 while the store
 *  is pre-sales and Shopify-checkout purchase events are not reaching GA4. */
export async function getWeeklySales(): Promise<WeeklySales | null> {
  return unstable_cache(
    async () => {
      const client = getClient();
      const property = propertyPath();
      if (!client || !property) return null;
      try {
        const { current } = ranges('7d');
        const [res] = await client.runReport({
          property,
          dateRanges: [current],
          metrics: [{ name: 'ecommercePurchases' }, { name: 'totalRevenue' }],
        });
        const row = res.rows?.[0];
        return {
          orders: Number(row?.metricValues?.[0]?.value ?? 0),
          revenue: Number(row?.metricValues?.[1]?.value ?? 0),
        };
      } catch {
        return null;
      }
    },
    ['ga-weekly-sales'],
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
