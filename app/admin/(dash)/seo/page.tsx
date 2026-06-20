import {
  getMoissaniteHubProgress,
  hubPath,
  HUBS,
  STAGE_LABELS,
  TIER_LABELS,
  type JourneyStage,
  type HubArticleStatus,
} from '@/lib/admin/seo';

export const dynamic = 'force-dynamic';

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
  const progress = await getMoissaniteHubProgress();
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
