import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

function load(file, overrides = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  const context = { exports, require, process, setTimeout, clearTimeout, console, URL, URLSearchParams, ...overrides };
  vm.runInNewContext(code, context, { filename: file });
  return exports;
}

async function main() {
  process.env.NEXT_PUBLIC_GA4_ID = 'G-TEST';
  const store = new Map();
  const localStorage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  const browserWindow = { location: { href: 'https://www.miozuki.co.nz/products/ring?utm_source=google&utm_medium=cpc&gclid=test-click', pathname: '/products/ring' } };
  const attribution = load('lib/attribution.ts', { window: browserWindow, localStorage, crypto: { randomUUID: () => 'fallback-only' } });
  attribution.captureAttributionOnLanding();
  let attrs = Object.fromEntries(attribution.getStoredAttributionAttributes().map(a => [a.key, a.value]));
  assert.equal(attrs._gclid, 'test-click');
  assert.equal(attrs._ga_client_id, undefined, 'No invented Google identifier before the tag loads');
  browserWindow.gtag = (_, id, field, callback) => { assert.equal(id, 'G-TEST'); setTimeout(() => callback(field === 'client_id' ? '123.456' : 1700000000), 5); };
  await attribution.refreshAttributionIdentifiers(50);
  attrs = Object.fromEntries(attribution.getStoredAttributionAttributes().map(a => [a.key, a.value]));
  assert.equal(attrs._ga_client_id, '123.456');
  assert.equal(attrs._ga_session_id, '1700000000');
  assert.equal(attrs._attribution_fallback_id, undefined);
  browserWindow.location.href = 'https://www.miozuki.co.nz/';
  browserWindow.location.pathname = '/';
  await attribution.refreshAttributionIdentifiers(50);
  attrs = Object.fromEntries(attribution.getStoredAttributionAttributes().map(a => [a.key, a.value]));
  assert.equal(attrs._gclid, 'test-click', 'A direct return must preserve saved ad attribution');
  assert.equal(attrs._landing_path, '/products/ring');
  browserWindow.gtag = () => {};
  const started = Date.now();
  await attribution.refreshAttributionIdentifiers(25);
  assert.ok(Date.now() - started < 200, 'Blocked tag must have a bounded wait');
  store.set('miozuki-attribution', JSON.stringify({ gaClientId: 'not-a-google-id', gaSessionId: 's123$o1', fallbackId: 'fallback-only' }));
  attrs = Object.fromEntries(attribution.getStoredAttributionAttributes().map(a => [a.key, a.value]));
  assert.equal(attrs._ga_client_id, undefined);
  assert.equal(attrs._ga_session_id, undefined, 'Reject old cookie-parser output');
  let warned = false;
  let persisted = false;
  let fail = false;
  let hang = false;
  const cart = load('lib/cart-attribution.ts', { require: (name) => name === './attribution' ? attribution : {
    updateCartAttributes: async () => {
      if (fail) throw new Error('Shopify unavailable');
      if (hang) return new Promise(() => {});
      await new Promise(resolve => setTimeout(resolve, 15));
      persisted = true;
    },
  }, console: { warn: () => { warned = true; } } });
  delete browserWindow.gtag;
  await cart.persistCartAttribution('test-cart');
  assert.equal(persisted, true, 'Cart write must complete before handing over');
  fail = true;
  await cart.persistCartAttribution('test-cart');
  assert.equal(warned, true, 'A failed write is visible but must not prevent checkout');
  fail = false;
  hang = true;
  const timeoutStarted = Date.now();
  await cart.persistCartAttribution('test-cart');
  assert.ok(Date.now() - timeoutStarted < 1800, 'A hanging cart write cannot trap the customer');
  console.log('PASS: late tag identifiers, preserved source, invalid IDs, blocked tag, awaited cart write, failed and hanging writes.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
