import { getRecentDeployments } from '@/lib/admin/vercel';
import { checkSiteUp } from '@/lib/admin/health';

export const dynamic = 'force-dynamic';

function timeAgo(ts: number): string {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function stateLabel(state: string): { label: string; tone: 'ok' | 'warn' | 'bad' } {
  switch (state) {
    case 'READY':
      return { label: 'Live', tone: 'ok' };
    case 'BUILDING':
    case 'QUEUED':
    case 'INITIALIZING':
      return { label: 'Publishing', tone: 'warn' };
    case 'ERROR':
    case 'CANCELED':
      return { label: 'Failed', tone: 'bad' };
    default:
      return { label: state, tone: 'warn' };
  }
}

const toneText: Record<'ok' | 'warn' | 'bad', string> = {
  ok: 'text-[#3f7d52]',
  warn: 'text-[#b8860b]',
  bad: 'text-burgundy',
};

export default async function AdminHome() {
  const [deploys, siteUp] = await Promise.all([
    getRecentDeployments(),
    checkSiteUp(),
  ]);

  const last = deploys?.[0];
  const lastState = last ? stateLabel(last.state) : null;
  const healthy =
    siteUp !== false && (!last || last.state === 'READY');
  const vercelConnected = deploys !== null;

  return (
    <div>
      {/* Hero status */}
      <section
        className={`rounded-2xl border border-border p-7 sm:p-8 mb-6 flex items-center gap-5 ${
          healthy
            ? 'bg-gradient-to-br from-[#fbf7f1] to-blush'
            : 'bg-gradient-to-br from-[#fbf7f1] to-champagne'
        }`}
      >
        <div
          className={`flex-none w-12 h-12 rounded-full flex items-center justify-center text-white text-3xl ${
            healthy ? 'bg-[#3f7d52]' : 'bg-[#b8860b]'
          }`}
          aria-hidden
        >
          {healthy ? '✓' : '!'}
        </div>
        <div>
          <h1 className="font-serif text-3xl sm:text-[30px] text-charcoal">
            {healthy ? 'Your site is live and healthy' : 'Worth a look'}
          </h1>
          <p className="text-graphite text-base sm:text-[17px] mt-0.5">
            {last
              ? `Last change ${timeAgo(last.created)}.`
              : 'Connect Vercel to see your latest change here.'}{' '}
            {healthy
              ? 'Nothing needs your attention right now.'
              : 'Check the details below.'}
          </p>
        </div>
      </section>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        <Tile
          label="Site status"
          value={siteUp === null ? 'Unknown' : siteUp ? 'Up' : 'Down'}
          tone={siteUp === false ? 'bad' : siteUp ? 'ok' : 'warn'}
          sub={siteUp ? 'Responding normally' : 'Could not reach the site'}
        />
        <Tile
          label="Last publish"
          value={lastState ? lastState.label : '—'}
          tone={lastState ? lastState.tone : 'warn'}
          sub={last ? timeAgo(last.created) : 'Connect Vercel'}
        />
      </div>

      {/* Recent changes */}
      <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
        <h2 className="font-serif text-xl text-charcoal">Your recent changes</h2>
        <p className="text-base text-graphite mb-4">
          Everything you have published, newest first.
        </p>
        {!vercelConnected ? (
          <p className="text-base text-graphite">
            Not connected yet. Add a Vercel read token (<code>VERCEL_API_TOKEN</code>)
            to show your publish history here.
          </p>
        ) : deploys && deploys.length > 0 ? (
          <ul>
            {deploys.map((d) => {
              const s = stateLabel(d.state);
              return (
                <li
                  key={d.uid}
                  className="flex items-center gap-4 py-3 border-b border-border last:border-b-0"
                >
                  <span
                    className={`flex-none text-xs font-medium px-2.5 py-1 rounded-full bg-cream ${toneText[s.tone]}`}
                  >
                    {s.label}
                  </span>
                  <span className="flex-1 text-base text-charcoal">
                    {d.commitMessage ?? 'Update'}
                  </span>
                  <span className="text-base text-graphite">
                    {timeAgo(d.created)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-base text-graphite">No deployments found yet.</p>
        )}
      </section>

      {/* Quick actions */}
      <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
        <h2 className="font-serif text-xl text-charcoal">Quick actions</h2>
        <p className="text-base text-graphite mb-4">
          If a change looks wrong, open Cursor and say &ldquo;put the site
          back&rdquo;. It undoes your last change and the site returns to how it
          was, live within a minute.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://admin.shopify.com"
            target="_blank"
            rel="noreferrer"
            className="text-base font-medium px-5 py-2.5 rounded-lg border border-burgundy text-burgundy hover:bg-blush transition-colors"
          >
            Open Shopify admin
          </a>
          <a
            href="https://www.miozuki.co.nz"
            target="_blank"
            rel="noreferrer"
            className="text-base font-medium px-5 py-2.5 rounded-lg border border-border text-charcoal hover:bg-cream transition-colors"
          >
            View live site
          </a>
          {process.env.NEXT_PUBLIC_STATUS_PAGE_URL ? (
            <a
              href={process.env.NEXT_PUBLIC_STATUS_PAGE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-base font-medium px-5 py-2.5 rounded-lg border border-border text-charcoal hover:bg-cream transition-colors"
            >
              Uptime status
            </a>
          ) : null}
        </div>
      </section>

      {/* Deferred */}
      <section className="rounded-xl border border-dashed border-border bg-cream/60 p-6 opacity-70">
        <span className="inline-block text-[13px] font-medium tracking-wide uppercase text-graphite border border-border rounded-full px-2.5 py-0.5 mb-2">
          Later
        </span>
        <h2 className="font-serif text-xl text-charcoal">Sales &amp; reviews</h2>
        <p className="text-base text-graphite">
          Orders, revenue and new reviews can live here once Shopify and Judge.me
          are wired up. Not part of this first version.
        </p>
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone: 'ok' | 'warn' | 'bad';
  sub: string;
}) {
  return (
    <div className="bg-white-soft border border-border rounded-xl p-5">
      <div className="text-[13px] font-medium tracking-wide uppercase text-graphite mb-2">
        {label}
      </div>
      <div className={`font-serif text-3xl ${toneText[tone]}`}>{value}</div>
      <div className="text-[15px] text-graphite mt-1">{sub}</div>
    </div>
  );
}
