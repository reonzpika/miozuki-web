/**
 * Pure text transforms used by the advisor chat renderer, kept React-free so
 * scripts/test-advisor-markdown.mts can pin their behaviour (regression guard
 * for the 2026-07-11 rendering bugs).
 */

// Boundary is start-of-line or whitespace ONLY. Including "(" here once
// double-wrapped the target inside an existing [label](/path) link, which the
// regression script caught on its first run. Do not widen the boundary.
const BARE_PATH =
  /(^|\s)(\/(?:products|collections|pages|policies|moissanite-guide|pearl-guide|bridal-guide)(?:\/[\w-]+)*)(?=[\s).,;:!?]|$)/gm;
// "*" is allowed as an email boundary so **bold@email.com** still gets a
// mailto pill; unlike "(", an asterisk cannot precede a markdown link target,
// so the double-wrap hazard does not apply here.
const BARE_EMAIL = /(^|[\s*])([\w.+-]+@[\w-]+(?:\.[\w-]+)+)(?=[\s*).,;:!?]|$)/gm;

/** Wrap bare site paths and bare emails in markdown links; CommonMark leaves
 * them as plain text but the model sometimes emits them despite the prompt. */
export function linkifyBareRefs(text: string): string {
  return text
    .replace(BARE_PATH, (_m, pre: string, path: string) => `${pre}[${path}](${path})`)
    .replace(BARE_EMAIL, (_m, pre: string, email: string) => `${pre}[${email}](mailto:${email})`);
}

/** Normalise absolute Miozuki URLs to relative paths so they stay in-app. */
export function toInternalHref(href: string): string {
  try {
    const url = new URL(href, 'https://www.miozuki.co.nz');
    if (url.hostname === 'www.miozuki.co.nz' || url.hostname === 'miozuki.co.nz') {
      return url.pathname + url.search;
    }
  } catch {
    // fall through, use as-is
  }
  return href;
}
