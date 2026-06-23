// Reads GA4 visitor numbers for the admin Analytics tab via the GA4 Data API.
// Credential-gated and graceful: if the service-account env vars are missing or
// an API call fails, each function returns null and the UI shows a "not
// connected yet" state instead of breaking. Same shape as lib/admin/vercel.ts.
//
// Env (set in .env.local and Vercel):
//   GA_PROPERTY_ID      the numeric GA4 property id, e.g. 523095453
//   GA_SA_CLIENT_EMAIL  the service-account email (granted Viewer on the property)
//   GA_SA_PRIVATE_KEY   the service-account private key (literal \n is fine)
//
// The service account also needs the Google Analytics Data API enabled in its
// GCP project, and Viewer access on the property (GA4 admin > Property Access).

import { BetaAnalyticsDataClient } from '@google-analytics/data';

let cachedClient: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient | null {
  const clientEmail = process.env.GA_SA_CLIENT_EMAIL;
  const rawKey = process.env.GA_SA_PRIVATE_KEY;
  if (!clientEmail || !rawKey) return null;
  if (cachedClient) return cachedClient;
  // Vercel stores the key with literal "\n"; turn those back into real newlines.
  // A key that already has real newlines (local .env) is left untouched.
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

export type VisitorSummary = {
  today: number;
  last7: number;
  last30: number;
};

export type TopPage = { title: string; path: string; views: number };
export type Channel = { name: string; sessions: number };

/** Active users on the site right now (GA4 realtime). */
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

/** Visitor counts for today, the last 7 days, and the last 30 days. */
export async function getVisitorSummary(): Promise<VisitorSummary | null> {
  const client = getClient();
  const property = propertyPath();
  if (!client || !property) return null;
  try {
    const [res] = await client.runReport({
      property,
      dateRanges: [
        { startDate: 'today', endDate: 'today' },
        { startDate: '7daysAgo', endDate: 'today' },
        { startDate: '30daysAgo', endDate: 'today' },
      ],
      metrics: [{ name: 'activeUsers' }],
    });
    // With multiple date ranges GA4 adds an automatic "dateRange" dimension
    // whose values are date_range_0, date_range_1, date_range_2.
    const out: VisitorSummary = { today: 0, last7: 0, last30: 0 };
    for (const row of res.rows ?? []) {
      const range = row.dimensionValues?.[0]?.value;
      const value = Number(row.metricValues?.[0]?.value ?? 0);
      if (range === 'date_range_0') out.today = value;
      else if (range === 'date_range_1') out.last7 = value;
      else if (range === 'date_range_2') out.last30 = value;
    }
    return out;
  } catch {
    return null;
  }
}

/** Most-viewed pages over the last 7 days. */
export async function getTopPages(limit = 8): Promise<TopPage[] | null> {
  const client = getClient();
  const property = propertyPath();
  if (!client || !property) return null;
  try {
    const [res] = await client.runReport({
      property,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
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
}

/** Where visitors came from over the last 7 days (channel grouping). */
export async function getChannels(limit = 6): Promise<Channel[] | null> {
  const client = getClient();
  const property = propertyPath();
  if (!client || !property) return null;
  try {
    const [res] = await client.runReport({
      property,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    });
    return (res.rows ?? []).map((row) => ({
      name: row.dimensionValues?.[0]?.value ?? 'Unknown',
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
    }));
  } catch {
    return null;
  }
}
