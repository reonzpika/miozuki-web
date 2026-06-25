// Builds the weekly store digest emailed to Ting (see app/api/cron/weekly-digest).
// Plain-English, in her product language, no jargon. Every metric source returns
// null gracefully, and each section is skipped when its data is missing.

import {
  getChannels,
  getDailyTrend,
  getSalesTotals,
  getTopPages,
  getVisitorSummary,
  getWeeklySales,
  type Channel,
  type Metric,
  type SalesTotals,
  type TopPage,
  type WeeklySales,
} from './analytics';
import { getSearchPerformance, getTopQueries } from './gsc';

export type DigestData = {
  visitors: Metric | null;
  channels: Channel[] | null;
  topPages: TopPage[] | null;
  weeklySales: WeeklySales | null;
  salesTotals: SalesTotals | null;
  searchClicks: number | null;
  busiestDay: { date: string; visitors: number } | null;
  topQuery: string | null;
};

export async function gatherDigestData(): Promise<DigestData> {
  const [summary, channels, topPages, weeklySales, salesTotals, search, trend, queries] =
    await Promise.all([
      getVisitorSummary('7d'),
      getChannels('7d', 3),
      getTopPages('7d', 3),
      getWeeklySales(),
      getSalesTotals(),
      getSearchPerformance(),
      getDailyTrend('7d'),
      getTopQueries(1),
    ]);

  const busiestDay =
    trend && trend.length > 0
      ? trend.reduce((a, b) => (b.visitors > a.visitors ? b : a), trend[0])
      : null;

  return {
    visitors: summary?.visitors ?? null,
    channels,
    topPages,
    weeklySales,
    salesTotals,
    searchClicks: search ? search.current.clicks : null,
    busiestDay,
    topQuery: queries && queries.length > 0 ? queries[0].query : null,
  };
}

// Representative numbers, used only by the preview route when live analytics is
// not connected in the current environment, so the layout is always reviewable.
export const SAMPLE_DATA: DigestData = {
  visitors: { current: 312, previous: 264 },
  channels: [
    { name: 'Organic Search', sessions: 188 },
    { name: 'Paid Social', sessions: 78 },
    { name: 'Direct', sessions: 46 },
  ],
  topPages: [
    { title: 'Classic Solitaire Ring', path: '/products/classic-solitaire', views: 142 },
    { title: 'Pearl Drop Studs', path: '/products/pearl-drop-studs', views: 96 },
    { title: 'Moissanite Pendant', path: '/products/moissanite-pendant', views: 71 },
  ],
  weeklySales: { orders: 0, revenue: 0 },
  salesTotals: { purchases: 2, revenue: 909 },
  searchClicks: 47,
  busiestDay: { date: '20260623', visitors: 68 },
  topQuery: 'moissanite ring nz',
};

// ── formatting helpers ──────────────────────────────────────────────────────

const num = new Intl.NumberFormat('en-NZ');
const money = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  maximumFractionDigits: 0,
});

function changePhrase(m: Metric): string {
  if (!m.previous) return '';
  const pct = Math.round(((m.current - m.previous) / m.previous) * 100);
  if (pct === 0) return ' (about the same as last week)';
  return pct > 0 ? ` (up ${pct}% on last week)` : ` (down ${Math.abs(pct)}% on last week)`;
}

function weekday(gaDate: string): string {
  const iso = /^\d{8}$/.test(gaDate)
    ? `${gaDate.slice(0, 4)}-${gaDate.slice(4, 6)}-${gaDate.slice(6, 8)}`
    : gaDate;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? gaDate
    : d.toLocaleDateString('en-NZ', { weekday: 'long' });
}

function channelShares(channels: Channel[]): { name: string; pct: number }[] {
  const total = channels.reduce((s, c) => s + c.sessions, 0) || 1;
  return channels.map((c) => ({ name: c.name, pct: Math.round((c.sessions / total) * 100) }));
}

// ── email ───────────────────────────────────────────────────────────────────

const STORE_URL = 'https://www.miozuki.co.nz';

const C = {
  cream: '#f5f0e9',
  card: '#fffcf8',
  burgundy: '#7B1E22',
  charcoal: '#1f1f1f',
  graphite: '#4b4b4b',
  border: 'rgba(31,31,31,0.12)',
};

function line(html: string): string {
  return `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.charcoal}">${html}</p>`;
}
function b(s: string): string {
  return `<strong style="color:${C.burgundy}">${s}</strong>`;
}

export function buildDigestEmail(
  data: DigestData,
  weekEnding: Date,
): { subject: string; html: string } {
  const ending = weekEnding.toLocaleDateString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const parts: string[] = [];

  if (data.visitors) {
    parts.push(
      line(
        `${b(`${num.format(data.visitors.current)} people visited`)} your store this week${changePhrase(
          data.visitors,
        )}.`,
      ),
    );
  }

  if (data.weeklySales || data.salesTotals) {
    const wk = data.weeklySales ? num.format(data.weeklySales.orders) : '0';
    const total = data.salesTotals
      ? `${num.format(data.salesTotals.purchases)} (${money.format(data.salesTotals.revenue)})`
      : null;
    parts.push(
      line(
        `Orders this week: ${b(wk)}.${total ? ` Total orders so far: ${b(total)}.` : ''}`,
      ),
    );
  }

  if (data.channels && data.channels.length > 0) {
    const shares = channelShares(data.channels)
      .map((s) => `${s.name} (${s.pct}%)`)
      .join(', ');
    parts.push(line(`They mostly came from: ${b(shares)}.`));
  }

  if (data.topPages && data.topPages.length > 0) {
    const names = data.topPages.map((p) => p.title || p.path).join(', ');
    parts.push(line(`The pieces they looked at most: ${b(names)}.`));
  }

  if (data.searchClicks !== null) {
    parts.push(
      line(
        `In Google search, your pages earned ${b(`${num.format(data.searchClicks)} clicks`)} (last 28 days).`,
      ),
    );
  }

  if (data.busiestDay) {
    parts.push(line(`Your busiest day was ${b(weekday(data.busiestDay.date))}.`));
  }

  if (data.topQuery) {
    parts.push(line(`People found you searching for ${b(`&ldquo;${data.topQuery}&rdquo;`)}.`));
  }

  const body =
    parts.length > 0
      ? parts.join('\n')
      : line('Your numbers will appear here once the analytics connection is finished.');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${C.cream}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};padding:24px 0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${C.card};border:1px solid ${C.border};border-radius:16px">
            <tr><td style="padding:28px 28px 8px">
              <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${C.burgundy};margin-bottom:6px">Miozuki</div>
              <h1 style="margin:0 0 2px;font-family:Georgia,serif;font-size:24px;color:${C.charcoal}">Your week at Miozuki</h1>
              <div style="font-size:14px;color:${C.graphite}">Week ending ${ending}</div>
            </td></tr>
            <tr><td style="padding:18px 28px 8px">
              ${body}
            </td></tr>
            <tr><td style="padding:8px 28px 28px">
              <a href="${STORE_URL}/admin" style="display:inline-block;font-size:15px;font-weight:600;color:${C.burgundy};text-decoration:none">See the full picture on your dashboard &rarr;</a>
            </td></tr>
          </table>
          <div style="font-size:12px;color:${C.graphite};margin-top:14px">Miozuki, NZ fine jewellery</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: `Your week at Miozuki — week ending ${ending}`, html };
}
