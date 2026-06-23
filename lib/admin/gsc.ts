// Reads Search Console performance for the admin SEO tab. Credential-gated and
// graceful, same shape as lib/admin/vercel.ts and lib/admin/analytics.ts: returns
// null when env vars are missing or a call fails, so the UI shows a "not
// connected yet" state instead of breaking.
//
// Uses the shared Google service account (the same GA_SA_* vars as the Analytics
// tab). That account must be a user on the Search Console property and have the
// Search Console API enabled in its GCP project.
//
// Env:
//   GSC_SITE_URL        the property, e.g. sc-domain:miozuki.co.nz
//   GA_SA_CLIENT_EMAIL  shared service-account email
//   GA_SA_PRIVATE_KEY   shared service-account private key (literal \n is fine)

import { searchconsole } from '@googleapis/searchconsole';
import { GoogleAuth } from 'google-auth-library';

type SearchConsoleClient = ReturnType<typeof searchconsole>;

let cachedClient: SearchConsoleClient | null = null;

function getClient(): SearchConsoleClient | null {
  const clientEmail = process.env.GA_SA_CLIENT_EMAIL;
  const rawKey = process.env.GA_SA_PRIVATE_KEY;
  if (!clientEmail || !rawKey) return null;
  if (cachedClient) return cachedClient;
  const privateKey = rawKey.replace(/\\n/g, '\n');
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  // google-auth-library resolves twice in the tree (once nested under google-gax
  // via @google-analytics/data), so this GoogleAuth instance and the type the
  // searchconsole() overload wants are nominally different despite being the same
  // runtime class. Cast to bridge that duplicate-type boundary.
  cachedClient = searchconsole({
    version: 'v1',
    auth: auth as unknown as never,
  });
  return cachedClient;
}

function site(): string | null {
  return process.env.GSC_SITE_URL || null;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// GSC data lags ~2-3 days; end the window at today-2, compare to the prior 28 days.
function windows() {
  const end = new Date();
  end.setDate(end.getDate() - 2);
  const start = new Date(end);
  start.setDate(start.getDate() - 27);
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - 27);
  return { start, end, prevStart, prevEnd };
}

export type SearchTotals = {
  clicks: number;
  impressions: number;
  ctr: number; // 0..1
  position: number;
};

export type SearchPerformance = {
  current: SearchTotals;
  previous: SearchTotals;
};

export type QueryRow = {
  query: string;
  clicks: number;
  impressions: number;
  position: number;
};
export type PageRow = {
  page: string;
  clicks: number;
  impressions: number;
  position: number;
};

async function totals(
  client: SearchConsoleClient,
  siteUrl: string,
  startDate: string,
  endDate: string,
): Promise<SearchTotals> {
  const res = await client.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions: [] },
  });
  const row = res.data.rows?.[0];
  return {
    clicks: row?.clicks ?? 0,
    impressions: row?.impressions ?? 0,
    ctr: row?.ctr ?? 0,
    position: row?.position ?? 0,
  };
}

/** Clicks / impressions / CTR / average position for the last 28 days vs the prior 28. */
export async function getSearchPerformance(): Promise<SearchPerformance | null> {
  const client = getClient();
  const siteUrl = site();
  if (!client || !siteUrl) return null;
  try {
    const { start, end, prevStart, prevEnd } = windows();
    const [current, previous] = await Promise.all([
      totals(client, siteUrl, ymd(start), ymd(end)),
      totals(client, siteUrl, ymd(prevStart), ymd(prevEnd)),
    ]);
    return { current, previous };
  } catch {
    return null;
  }
}

/** Top search queries over the last 28 days. */
export async function getTopQueries(limit = 8): Promise<QueryRow[] | null> {
  const client = getClient();
  const siteUrl = site();
  if (!client || !siteUrl) return null;
  try {
    const { start, end } = windows();
    const res = await client.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: ymd(start),
        endDate: ymd(end),
        dimensions: ['query'],
        rowLimit: limit,
      },
    });
    return (res.data.rows ?? []).map((r) => ({
      query: r.keys?.[0] ?? '',
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      position: r.position ?? 0,
    }));
  } catch {
    return null;
  }
}

/** Top landing pages from search over the last 28 days. */
export async function getTopPages(limit = 8): Promise<PageRow[] | null> {
  const client = getClient();
  const siteUrl = site();
  if (!client || !siteUrl) return null;
  try {
    const { start, end } = windows();
    const res = await client.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: ymd(start),
        endDate: ymd(end),
        dimensions: ['page'],
        rowLimit: limit,
      },
    });
    return (res.data.rows ?? []).map((r) => ({
      page: r.keys?.[0] ?? '',
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      position: r.position ?? 0,
    }));
  } catch {
    return null;
  }
}
