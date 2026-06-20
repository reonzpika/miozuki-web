// Data model + live-progress for the admin SEO tab. The plan itself (hubs and the
// moissanite cluster map) is the north star for Ting; the status of each article
// is auto-detected from what is actually published, so the page never lies about
// progress. Source plan: areas/miozuki/.../miozuki-content-hub-masterplan-20260502.md

export type JourneyStage = 'awareness' | 'consideration' | 'decision' | 'own';
export type Tier = 'pillar' | 'tier1' | 'tier2' | 'tier3' | 'self';

export const STAGE_LABELS: Record<JourneyStage, { label: string; blurb: string }> = {
  awareness: { label: 'First search', blurb: 'She has just heard the word moissanite and is googling it.' },
  consideration: { label: 'Comparing', blurb: 'Weighing moissanite against the alternatives.' },
  decision: { label: 'Deciding', blurb: 'Ready to choose, working out the specifics.' },
  own: { label: 'Owning it', blurb: 'Bought, or buying for herself, and looking after it.' },
};

export const TIER_LABELS: Record<Tier, string> = {
  pillar: 'Pillar',
  tier1: 'Go-live set',
  tier2: 'Next layer',
  tier3: 'Trust layer',
  self: 'Self-purchase',
};

export type HubArticle = {
  slug: string;
  title: string;
  answers: string;
  tier: Tier;
  stage: JourneyStage;
};

/** The moissanite-guide cluster map (the only hub planned in detail). 16 pages. */
export const MOISSANITE_ARTICLES: HubArticle[] = [
  { slug: 'moissanite-guide', title: 'What is moissanite? (the pillar)', answers: 'The one page that introduces everything and links to the rest.', tier: 'pillar', stage: 'awareness' },
  { slug: 'moissanite-vs-diamond-nz', title: 'Moissanite vs diamond', answers: 'The big comparison. Already ranking as a blog post, move it here.', tier: 'tier1', stage: 'consideration' },
  { slug: 'moissanite-vs-lab-diamond-nz', title: 'Moissanite vs lab diamond', answers: 'The other comparison she is weighing up.', tier: 'tier1', stage: 'consideration' },
  { slug: 'how-to-choose-moissanite-engagement-ring-nz', title: 'How to choose a moissanite engagement ring', answers: 'The buying guide. High intent, close to a sale.', tier: 'tier1', stage: 'decision' },
  { slug: 'moissanite-grades-brands-nz', title: 'Moissanite grades and brands', answers: 'Forever One, Harro Gem, NEO, unbranded, what the differences mean.', tier: 'tier1', stage: 'decision' },
  { slug: 'does-moissanite-look-fake-nz', title: 'Does moissanite look fake?', answers: 'Removes the number-one worry. The highest-converting article.', tier: 'tier2', stage: 'consideration' },
  { slug: 'moissanite-vs-cubic-zirconia-nz', title: 'Moissanite vs cubic zirconia', answers: 'The cheaper lookalike. Every overseas guide covers it; NZ has none.', tier: 'tier2', stage: 'consideration' },
  { slug: 'moissanite-shapes-guide-nz', title: 'Shape guide', answers: 'Round, oval, cushion, pear, emerald, marquise.', tier: 'tier2', stage: 'decision' },
  { slug: 'moissanite-sizing-guide', title: 'Sizing guide', answers: 'Carat versus the millimetre size you actually see.', tier: 'tier2', stage: 'decision' },
  { slug: 'moissanite-care-cleaning-guide', title: 'Care and cleaning', answers: 'Keeping it sparkling. Reassures before and after buying.', tier: 'tier2', stage: 'own' },
  { slug: 'ethical-engagement-rings-nz', title: 'Ethical engagement rings', answers: 'The "why" article. Speaks to the ethical buyer.', tier: 'tier2', stage: 'decision' },
  { slug: 'moissanite-resale-value-nz', title: 'Resale value, honestly', answers: 'An honest answer builds trust and earns links.', tier: 'tier3', stage: 'decision' },
  { slug: 'moissanite-retailers-nz', title: 'NZ moissanite retailer comparison', answers: 'Fair comparison of NZ stockists. Link-building and authority.', tier: 'tier3', stage: 'decision' },
  { slug: 'alternatives-diamond-engagement-rings-nz', title: 'Alternatives to diamond', answers: 'The round-up for anyone still exploring.', tier: 'tier3', stage: 'consideration' },
  { slug: 'moissanite-earrings-nz', title: 'What to look for in moissanite earrings', answers: 'For the woman buying for herself.', tier: 'self', stage: 'own' },
  { slug: 'moissanite-self-gift', title: 'Moissanite as a self-purchase', answers: 'The considered treat-yourself piece.', tier: 'self', stage: 'own' },
];

export type HubArticleStatus = HubArticle & { live: boolean };

export type HubProgress = {
  articles: HubArticleStatus[];
  liveCount: number;
  total: number;
};

const LIVE_BASE = 'https://www.miozuki.co.nz';

/** A hub article counts as live only when its real page is published and reachable. */
function hubUrl(slug: string): string {
  return slug === 'moissanite-guide'
    ? `${LIVE_BASE}/moissanite-guide`
    : `${LIVE_BASE}/moissanite-guide/${slug}`;
}

async function isPublished(slug: string): Promise<boolean> {
  try {
    const res = await fetch(hubUrl(slug), { method: 'HEAD', next: { revalidate: 600 } });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Detects which planned guides are actually published by checking whether each
 * hub page is reachable. The hub is not built yet, so expect 0; that gap is the
 * point of the page. It flips to Live on its own as pages ship. Best-effort: a
 * fetch failure counts as Planned rather than throwing.
 */
export async function getMoissaniteHubProgress(): Promise<HubProgress> {
  const articles = await Promise.all(
    MOISSANITE_ARTICLES.map(async (a) => ({ ...a, live: await isPublished(a.slug) })),
  );
  return {
    articles,
    liveCount: articles.filter((a) => a.live).length,
    total: articles.length,
  };
}

export type Hub = {
  key: string;
  name: string;
  scope: string;
  flagship: boolean;
};

/** The content territories the brand wants to own. Only moissanite is planned in detail. */
export const HUBS: Hub[] = [
  { key: 'moissanite-guide', name: 'Moissanite guide', scope: 'Everything a buyer searches about moissanite, from first question to final choice.', flagship: true },
  { key: 'pearl-guide', name: 'Pearl guide', scope: 'The pearl counterpart: types, care, styling. Our second category.', flagship: false },
  { key: 'engagement-bridal', name: 'Engagement & bridal', scope: 'Choosing an engagement ring and the wider bridal jewellery decision.', flagship: false },
  { key: 'promise-ring', name: 'Promise ring', scope: 'Meaning, styles and how to choose a promise ring.', flagship: false },
];
