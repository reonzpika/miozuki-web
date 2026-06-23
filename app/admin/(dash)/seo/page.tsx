import {
  getMoissaniteHubProgress,
  hubPath,
  HUBS,
  STAGE_LABELS,
  TIER_LABELS,
  type JourneyStage,
  type HubArticleStatus,
} from '@/lib/admin/seo';
import {
  getSearchPerformance,
  getTopQueries,
  getTopPages,
  type SearchTotals,
} from '@/lib/admin/gsc';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

const nf = new Intl.NumberFormat('en-NZ');

// A clicks/impressions-style delta vs the previous 28 days. Up is good.
function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev) return null;
  const pct = Math.round(((now - prev) / prev) * 100);
  if (pct === 0) return <span className="text-[14px] text-graphite">no change</span>;
  const up = pct > 0;
  return (
    <span className={`text-[14px] font-medium ${up ? 'text-[#3f7d52]' : 'text-burgundy'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

// Average position: lower is better, so the colour logic is reversed.
function PositionDelta({ now, prev }: { now: number; prev: number }) {
  if (!prev) return null;
  const diff = +(now - prev).toFixed(1);
  if (diff === 0) return <span className="text-[14px] text-graphite">no change</span>;
  const better = diff < 0; // moved up the page
  return (
    <span className={`text-[14px] font-medium ${better ? 'text-[#3f7d52]' : 'text-burgundy'}`}>
      {better ? '▲' : '▼'} {Math.abs(diff)}
    </span>
  );
}

function PerfTile({
  label,
  value,
  delta,
  sub,
}: {
  label: string;
  value: string;
  delta: ReactNode;
  sub: string;
}) {
  return (
    <div className="bg-white-soft border border-border rounded-xl p-5">
      <div className="text-[13px] font-medium tracking-wide uppercase text-graphite mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl text-charcoal">{value}</span>
        {delta}
      </div>
      <div className="text-[15px] text-graphite mt-1">{sub}</div>
    </div>
  );
}

// Trim the property prefix so a page reads as a tidy path.
function shortPath(url: string): string {
  try {
    return new URL(url).pathname || url;
  } catch {
    return url.replace(/^sc-domain:/, '');
  }
}

function ctrPct(t: SearchTotals): string {
  return `${(t.ctr * 100).toFixed(1)}%`;
}

const STAGE_ORDER: JourneyStage[] = ['awareness', 'consideration', 'decision', 'own'];
// Taper the bands so the journey reads as a funnel narrowing toward a purchase.
const STAGE_WIDTH: Record<JourneyStage, string> = {
  awareness: 'max-w-full',
  consideration: 'max-w-3xl',
  decision: 'max-w-2xl',
  own: 'max-w-xl',
};

function StatusChip({ live }: { live: boolean }) {
  return (
    <span
      className={`flex-none text-[13px] font-medium px-2 py-0.5 rounded-full ${
        live ? 'bg-[#e7f0ea] text-[#3f7d52]' : 'bg-cream text-graphite'
      }`}
    >
      {live ? 'Live' : 'Planned'}
    </span>
  );
}

export default async function AdminSeo() {
  const [progress, perf, queries, pages] = await Promise.all([
    getMoissaniteHubProgress(),
    getSearchPerformance(),
    getTopQueries(),
    getTopPages(),
  ]);
  const gscConnected = perf !== null;
  const byStage = (s: JourneyStage): HubArticleStatus[] =>
    progress.articles.filter((a) => a.stage === s);
  const pillar = progress.articles.find((a) => a.tier === 'pillar');
  const nextArticle = progress.articles.find((a) => !a.live) ?? pillar;

  return (
    <div>
      {/* Goal hero */}
      <section className="rounded-2xl border border-border p-7 sm:p-8 mb-6 bg-gradient-to-br from-[#fbf7f1] to-blush">
        <div className="text-[14px] font-medium tracking-[0.15em] uppercase text-burgundy mb-2">
          Our north star
        </div>
        <h1 className="font-serif text-3xl sm:text-[32px] text-charcoal leading-snug">
          Become the place New Zealand reads to learn about fine jewellery.
        </h1>
        <p className="text-graphite text-base sm:text-[17px] mt-2 max-w-2xl">
          We win by owning the research, not by shouting louder. When someone googles a
          question, our guide is the answer they trust, and the trust is what turns into a
          sale. This page is the map. It shows what to build, and in what order, so the writing
          adds up to something instead of being one-off posts.
        </p>
      </section>

      {/* How we're doing in Google (live from Search Console) */}
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-serif text-2xl text-charcoal">How we&rsquo;re doing in Google</h2>
        <span className="text-base text-graphite">Last 28 days, vs the 28 before</span>
      </div>
      <p className="text-base text-graphite mb-4 max-w-2xl">
        Real numbers from Google Search. <span className="font-medium text-charcoal">Shown</span> is
        how many times we appeared in search results, <span className="font-medium text-charcoal">clicks</span> is
        how many people came through, and <span className="font-medium text-charcoal">average spot</span> is
        roughly where we sit on the results page (1 is the top).
      </p>

      {gscConnected && perf ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <PerfTile
              label="Clicks"
              value={nf.format(perf.current.clicks)}
              delta={<Delta now={perf.current.clicks} prev={perf.previous.clicks} />}
              sub="people who came through"
            />
            <PerfTile
              label="Shown"
              value={nf.format(perf.current.impressions)}
              delta={<Delta now={perf.current.impressions} prev={perf.previous.impressions} />}
              sub="times we appeared"
            />
            <PerfTile
              label="Click rate"
              value={ctrPct(perf.current)}
              delta={
                <Delta
                  now={perf.current.ctr * 1e6}
                  prev={perf.previous.ctr * 1e6}
                />
              }
              sub="of views that clicked"
            />
            <PerfTile
              label="Average spot"
              value={perf.current.position.toFixed(1)}
              delta={
                <PositionDelta now={perf.current.position} prev={perf.previous.position} />
              }
              sub="where we sit (1 = top)"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-9">
            <section className="bg-white-soft border border-border rounded-xl p-6">
              <h3 className="font-serif text-xl text-charcoal">What people search to find us</h3>
              <p className="text-base text-graphite mb-3">Top searches, last 28 days.</p>
              {queries && queries.length > 0 ? (
                <ul>
                  {queries.map((q) => (
                    <li
                      key={q.query}
                      className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0"
                    >
                      <span className="flex-1 text-base text-charcoal truncate">{q.query}</span>
                      <span className="flex-none text-base text-graphite">
                        {nf.format(q.clicks)} clicks
                      </span>
                      <span className="flex-none text-[14px] text-graphite/70 w-16 text-right">
                        spot {q.position.toFixed(0)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-graphite">No searches recorded yet.</p>
              )}
            </section>

            <section className="bg-white-soft border border-border rounded-xl p-6">
              <h3 className="font-serif text-xl text-charcoal">Pages people land on</h3>
              <p className="text-base text-graphite mb-3">Top pages from search, last 28 days.</p>
              {pages && pages.length > 0 ? (
                <ul>
                  {pages.map((p) => (
                    <li
                      key={p.page}
                      className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0"
                    >
                      <span className="flex-1 font-mono text-[14px] text-charcoal truncate">
                        {shortPath(p.page)}
                      </span>
                      <span className="flex-none text-base text-graphite">
                        {nf.format(p.clicks)} clicks
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-graphite">No pages recorded yet.</p>
              )}
            </section>
          </div>
        </>
      ) : (
        <section className="rounded-xl border border-dashed border-border bg-cream/60 p-6 mb-9">
          <span className="inline-block text-[13px] font-medium tracking-wide uppercase text-graphite border border-border rounded-full px-2.5 py-0.5 mb-2">
            Almost ready
          </span>
          <h3 className="font-serif text-xl text-charcoal">Search numbers not switched on yet</h3>
          <p className="text-base text-graphite">
            The live Google Search figures will appear here once the connection is finished.
            Nothing for you to do.
          </p>
        </section>
      )}

      {/* The two rules */}
      <h2 className="font-serif text-2xl text-charcoal mb-1">Two rules that keep this tidy</h2>
      <p className="text-base text-graphite mb-4 max-w-2xl">
        Follow these and the writing stays organised instead of scattered.
      </p>
      <div className="grid md:grid-cols-2 gap-4 mb-9">
        <div className="rounded-2xl border border-border p-6 bg-gradient-to-b from-[#fdfaf4] to-champagne">
          <div className="text-[15px] font-medium tracking-wide uppercase text-[#9a7b34] mb-1.5">
            1. Guide or blog, never both
          </div>
          <p className="text-[17px] text-charcoal">
            A <span className="font-medium">guide</span> is an evergreen answer that lives in a
            territory above (a moissanite guide goes under the moissanite hub). A{' '}
            <span className="font-medium">blog</span> post is news or a story tied to a moment.
            Ask: would this still be true and useful in two years? If yes, it is a guide. If it
            is about right now, it is a blog post. A topic is one or the other.
          </p>
        </div>
        <div className="rounded-2xl border border-border p-6 bg-white-soft">
          <div className="text-[15px] font-medium tracking-wide uppercase text-burgundy mb-1.5">
            2. Write the way we talk
          </div>
          <p className="text-[17px] text-charcoal">
            Warm, clear, honest. Help her, do not sell at her. Never use{' '}
            <span className="font-medium">stunning</span>,{' '}
            <span className="font-medium">gorgeous</span>,{' '}
            <span className="font-medium">perfect</span> or{' '}
            <span className="font-medium">unique</span>. These are banned from the Miozuki voice.
          </p>
        </div>
      </div>

      {/* Hub portfolio */}
      <h2 className="font-serif text-2xl text-charcoal mb-1">Our content territories</h2>
      <p className="text-base text-graphite mb-4 max-w-2xl">
        Each territory is a subject we want to own. Moissanite is the flagship and is mapped
        out in full below. The others are claimed, their guides get planned next.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-9">
        {HUBS.map((h) => (
          <div
            key={h.key}
            className={`rounded-2xl border p-6 ${
              h.flagship
                ? 'border-burgundy/30 bg-gradient-to-b from-[#fcf0ef] to-blush'
                : 'border-border bg-white-soft'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[13px] font-medium tracking-wide uppercase ${
                  h.flagship ? 'text-burgundy' : 'text-graphite'
                }`}
              >
                {h.flagship ? 'Flagship' : 'Territory'}
              </span>
              <span
                className={`text-[13px] font-medium px-2 py-0.5 rounded-full ${
                  h.flagship ? 'bg-burgundy text-white-soft' : 'bg-cream text-graphite'
                }`}
              >
                {h.flagship ? 'Building' : 'Planned'}
              </span>
            </div>
            <h3 className="font-serif text-xl text-charcoal">{h.name}</h3>
            <p className="text-[16px] text-graphite mt-1">{h.scope}</p>
            {!h.flagship ? (
              <p className="text-[15px] text-graphite/80 mt-2 italic">Guides to be planned.</p>
            ) : null}
          </div>
        ))}
      </div>

      {/* Flagship: the journey funnel */}
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-serif text-2xl text-charcoal">The moissanite guide, step by step</h2>
        <span className="text-base text-graphite">
          <span className="font-medium text-charcoal">{progress.liveCount}</span> of{' '}
          {progress.total} live
        </span>
      </div>
      <p className="text-base text-graphite mb-5 max-w-2xl">
        These are the guides that walk a buyer from her first search to owning the piece. Each
        one is a <span className="font-medium text-charcoal">page</span> on the site, built in
        code and edited in Cursor, an evergreen reference, not a Shopify blog post. Write them
        top to bottom: the early ones bring people in, the later ones win the decision.
      </p>

      <div className="space-y-3 mb-9">
        {STAGE_ORDER.map((stage) => {
          const items = byStage(stage);
          if (items.length === 0) return null;
          return (
            <section
              key={stage}
              className={`mx-auto w-full ${STAGE_WIDTH[stage]} rounded-xl border border-border bg-white-soft p-5`}
            >
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-[13px] font-medium tracking-wide uppercase text-burgundy">
                  {STAGE_LABELS[stage].label}
                </span>
                <span className="text-[15px] text-graphite">{STAGE_LABELS[stage].blurb}</span>
              </div>
              <ul className="space-y-3">
                {items.map((a) => (
                  <li key={a.slug} className="flex items-start gap-3">
                    <StatusChip live={a.live} />
                    <span className="flex-1">
                      <span className="text-[17px] text-charcoal">{a.title}</span>
                      <span className="block text-[15px] text-graphite">{a.answers}</span>
                      <span className="block font-mono text-[14px] text-graphite/70 mt-0.5">
                        miozuki.co.nz{hubPath(a.slug)}
                      </span>
                    </span>
                    <span className="flex-none text-[13px] text-graphite/70 mt-0.5">
                      {TIER_LABELS[a.tier]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Write this next */}
      <section className="rounded-xl bg-charcoal text-cream p-6">
        <div className="text-[14px] tracking-[0.15em] uppercase text-gold mb-2">
          Write this next
        </div>
        <p className="text-[19px]">
          Start with{' '}
          <span className="font-medium text-champagne">
            {nextArticle ? nextArticle.title : 'the pillar page'}
          </span>
          . The guide cannot go live until the pillar and the four go-live guides are written,
          and the AI advisor (a developer task) is in place, so that is the order to aim for.
        </p>
      </section>
    </div>
  );
}
