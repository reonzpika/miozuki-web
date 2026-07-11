/**
 * Regression guard for the advisor chat's message rendering.
 *
 * Three rendering bugs shipped in one day because the markdown renderer was
 * hand-rolled: bare paths not linked, raw ** and run-on lists, and absolute
 * miozuki.co.nz URLs left as plain text. The fix was react-markdown (parsing
 * is no longer our code) plus two small bespoke transforms, which are exactly
 * what this script pins down. Run after touching advisor-widget.tsx:
 *
 *   npx tsx scripts/test-advisor-markdown.mts
 */
import { linkifyBareRefs, toInternalHref } from '../lib/advisor/markdown-utils';

let failures = 0;
function check(name: string, actual: string, expected: string) {
  if (actual === expected) {
    console.log(`  ok  ${name}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${name}\n  expected: ${expected}\n  actual:   ${actual}`);
  }
}

console.log('linkifyBareRefs:');
check(
  'bare site path becomes a markdown link (bug #1, 2026-07-11)',
  linkifyBareRefs('read our guide at /moissanite-guide today'),
  'read our guide at [/moissanite-guide](/moissanite-guide) today'
);
check(
  'bare email becomes a mailto markdown link',
  linkifyBareRefs('the team at info@miozuki.co.nz can sort it'),
  'the team at [info@miozuki.co.nz](mailto:info@miozuki.co.nz) can sort it'
);
check(
  'existing markdown links are left untouched',
  linkifyBareRefs('see [the guide](/moissanite-guide/moissanite-vs-diamond-nz).'),
  'see [the guide](/moissanite-guide/moissanite-vs-diamond-nz).'
);
check(
  'path with trailing punctuation keeps punctuation outside the link',
  linkifyBareRefs('browse /collections/moissanite-rings.'),
  'browse [/collections/moissanite-rings](/collections/moissanite-rings).'
);
check(
  'email inside an existing mailto link is not double-wrapped',
  linkifyBareRefs('[info@miozuki.co.nz](mailto:info@miozuki.co.nz)'),
  '[info@miozuki.co.nz](mailto:info@miozuki.co.nz)'
);
check(
  'bold-wrapped email still gets a mailto link',
  linkifyBareRefs('email **info@miozuki.co.nz** anytime'),
  'email **[info@miozuki.co.nz](mailto:info@miozuki.co.nz)** anytime'
);

console.log('toInternalHref:');
check(
  'absolute www URL becomes relative (bug #3, 2026-07-11, Ryo screenshot)',
  toInternalHref('https://www.miozuki.co.nz/products/classic-moissanite-solitaire-ring'),
  '/products/classic-moissanite-solitaire-ring'
);
check(
  'absolute apex URL becomes relative',
  toInternalHref('https://miozuki.co.nz/collections/pearl-earrings'),
  '/collections/pearl-earrings'
);
check('relative path passes through', toInternalHref('/pages/size-guide'), '/pages/size-guide');
check(
  'external URL is left external',
  toInternalHref('https://example.com/x'),
  'https://example.com/x'
);

// Bug #2 (raw ** and run-on numbered lists) is covered by react-markdown
// itself, which is exactly why parsing moved off bespoke code. Sanity-check
// that the library is importable so a broken dependency fails loudly here.
import('react-markdown')
  .then((rm) => {
    if (typeof rm.default !== 'function') {
      failures += 1;
      console.error('FAIL  react-markdown did not import as a component');
    } else {
      console.log('  ok  react-markdown importable (bold/list/link parsing delegated to it)');
    }
  })
  .catch((err) => {
    failures += 1;
    console.error('FAIL  react-markdown import threw:', err?.message);
  })
  .finally(() => {
    if (failures > 0) {
      console.error(`\n${failures} failure(s)`);
      process.exit(1);
    }
    console.log('\nAll advisor markdown checks passed.');
  });
