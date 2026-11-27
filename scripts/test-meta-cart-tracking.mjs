import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Every dependency and browser global is controlled. No HTTP, cart write or
// real pixel SDK is available to this test.
function load(file, globals) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { exports, ...globals }, { filename: file });
  return exports;
}
const tick = async () => { await Promise.resolve(); await Promise.resolve(); };
const selectedVariant = () => ({ id: 'gid://shopify/ProductVariant/2', title: 'Selected silver',
  availableForSale: true, price: { amount: '125.50', currencyCode: 'NZD' },
  compareAtPrice: null, selectedOptions: [{ name: 'Title', value: 'Default Title' }] });

function tracker(options = {}) {
  const state = { production: true, permission: 'allowed', calls: [], privacyLoads: 0,
    ready: Promise.resolve(), ...options };
  const window = { fbq: (...args) => { state.calls.push(args); } };
  const trackerExports = load('lib/meta-events.ts', {
    window,
    process: { env: { NEXT_PUBLIC_META_PIXEL_ID: options.pixelId ?? '123456789012345' } },
    require: name => {
      if (name === '@/lib/analytics-host') return { isProductionTrackingContext: () => state.production };
      if (name === '@/lib/tracking-privacy') return {
        trackingPermission: () => state.permission,
        loadTrackingPrivacy: () => { state.privacyLoads++; return state.ready; },
      };
      throw Error(`Unexpected dependency: ${name}`);
    },
  });
  return { ...trackerExports, state, window };
}
const input = () => ({ productTitle: 'Synthetic ring', variant: selectedVariant(), quantity: 2 });

{
  const browserWindow = { location: { hostname: 'www.miozuki.co.nz', pathname: '/products/ring' } };
  const host = load('lib/analytics-host.ts', { window: browserWindow,
    require: () => ({ useSyncExternalStore: () => {}, usePathname: () => {} }) });
  assert.equal(host.isProductionTrackingContext(), true);
  for (const hostname of ['localhost', '127.0.0.1', 'preview.vercel.app']) {
    browserWindow.location.hostname = hostname;
    assert.equal(host.isProductionTrackingContext(), false, 'Local and preview sessions cannot send');
  }
  browserWindow.location.hostname = 'www.miozuki.co.nz';
  browserWindow.location.pathname = '/admin/orders';
  assert.equal(host.isProductionTrackingContext(), false, 'Admin sessions cannot send');
}
{
  const t = tracker();
  assert.equal(t.trackMetaAddToCart(input()), undefined, 'Telemetry returns immediately');
  await tick();
  assert.deepEqual(JSON.parse(JSON.stringify(t.state.calls)), [
    ['track', 'AddToCart', { content_name: 'Synthetic ring', currency: 'NZD', value: 251 }],
  ]);
}
{
  // Run the installed component's real bootstrap, retaining its deferred SDK.
  const t = tracker(); delete t.window.fbq;
  const effects = [], scripts = [];
  const browserGlobals = { window: t.window };
  Object.defineProperty(browserGlobals, 'fbq', { get: () => t.window.fbq });
  const document = { getElementById: () => null, createElement: () => ({}), head: {
    appendChild: script => { scripts.push(script);
      if (script.textContent) vm.runInNewContext(script.textContent, browserGlobals);
    },
  } };
  const pixel = load('components/meta-pixel.tsx', { window: t.window, document,
    process: { env: { NEXT_PUBLIC_META_PIXEL_ID: '123456789012345' } },
    require: name => {
      if (name === 'react') return { useRef: current => ({ current }), useEffect: fn => effects.push(fn) };
      if (name === 'next/navigation') return { usePathname: () => '/products/ring' };
      if (name === '@/lib/analytics-host') return { useIsProductionTrackingContext: () => true };
      if (name === '@/hooks/use-deferred-third-party') return { useDeferredThirdParty: () => false };
      if (name === 'react/jsx-runtime') return { jsx: () => null };
      throw Error(`Unexpected pixel dependency: ${name}`);
    },
  });
  pixel.default(); effects.forEach(effect => effect());
  t.trackMetaAddToCart(input()); await tick();
  const queued = Array.from(t.window.fbq.queue, args => Array.from(args));
  assert.equal(queued.filter(args => args[1] === 'AddToCart').length, 1);
  assert.equal(scripts.some(script => script.src), false, 'No SDK network request in deferred test');
  const delivered = [];
  t.window.fbq.callMethod = (...args) => delivered.push(args);
  for (const args of t.window.fbq.queue.splice(0)) t.window.fbq.callMethod(...args);
  assert.equal(delivered.filter(args => args[1] === 'AddToCart').length, 1,
    'The installed queue can deliver the cart event once when the SDK becomes ready');
}
for (const options of [{ production: false }, { permission: 'denied' }, { pixelId: '' }]) {
  const t = tracker(options);
  t.trackMetaAddToCart(input()); await tick();
  assert.equal(t.state.calls.length, 0);
  assert.equal(t.state.privacyLoads, 0, 'Excluded contexts must not load third-party privacy scripts');
}
for (const permission of ['unknown', 'denied']) {
  const t = tracker({ permission });
  t.trackMetaAddToCart(input()); await tick();
  assert.equal(t.state.calls.length, 0, 'No event without marketing permission');
}
{
  let ready;
  const t = tracker({ permission: 'unknown', ready: new Promise(resolve => { ready = resolve; }) });
  const snapshot = input();
  t.trackMetaAddToCart(snapshot);
  snapshot.variant.price.amount = '999';
  assert.equal(t.state.calls.length, 0);
  t.state.permission = 'allowed'; ready(); await tick();
  assert.equal(t.state.calls.length, 1);
  assert.equal(t.state.calls[0][2].value, 251, 'Use the price at the completed cart action');
  await tick(); assert.equal(t.state.calls.length, 1, 'Readiness does not duplicate an event');
}
for (const change of ['deny', 'navigate']) {
  let ready;
  const t = tracker({ ready: new Promise(resolve => { ready = resolve; }) });
  t.trackMetaAddToCart(input());
  if (change === 'deny') t.state.permission = 'denied'; else t.state.production = false;
  ready(); await tick();
  assert.equal(t.state.calls.length, 0, 'Recheck privacy and context after readiness');
}
for (const change of ['missing', 'blocked', 'privacy-failure']) {
  const t = tracker();
  if (change === 'missing') delete t.window.fbq;
  if (change === 'blocked') t.window.fbq = () => { throw Error('Blocked SDK'); };
  if (change === 'privacy-failure') t.state.ready = Promise.reject(Error('Privacy unavailable'));
  assert.doesNotThrow(() => t.trackMetaAddToCart(input())); await tick();
}
for (const invalid of [
  { ...input(), quantity: 0 }, { ...input(), quantity: 1.5 },
  { ...input(), variant: { ...selectedVariant(), price: { amount: 'NaN', currencyCode: 'NZD' } } },
  { ...input(), variant: { ...selectedVariant(), price: { amount: '-10', currencyCode: 'NZD' } } },
  { ...input(), variant: { ...selectedVariant(), price: { amount: '10', currencyCode: 'invalid' } } },
]) {
  const t = tracker(); t.trackMetaAddToCart(invalid); await tick();
  assert.equal(t.state.calls.length, 0, 'Malformed telemetry must not send');
}

function cartButton({ add, meta, variant = selectedVariant(), gaThrows = false, sticky = false }) {
  const states = [], gaCalls = [];
  const jsx = (type, props) => ({ type, props });
  const cartExports = load('components/add-to-cart.tsx', {
    process: { env: { NODE_ENV: 'test' } }, setTimeout: () => 0,
    require: name => {
      if (name === 'react') return {
        useEffect: () => {}, useRef: value => ({ current: value }),
        useState: initial => [typeof initial === 'function' ? initial() : initial, value => states.push(value)],
        useSyncExternalStore: (_subscribe, _snapshot, serverSnapshot) => serverSnapshot(),
      };
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
      if (name === './cart-provider') return { useCart: () => ({ addToCart: add }) };
      if (name === '@/lib/meta-events') return meta;
      if (name === '@/lib/ga-events') return { trackAddToCart: event => {
        gaCalls.push(event); if (gaThrows) throw Error('Google blocked');
      } };
      if (name === '@/lib/ring-size-chart') return { isRingSizeOption: name => name === 'Ring size' };
      if (name === '@/lib/tracking-privacy') return { useAnalyticsPermission: () => 'allowed' };
      if (name === '@/lib/product-ring-size-chart') return {
        readProductRingSizeChart: () => null, isProductRingSizeAllowed: () => true,
      };
      if (name.startsWith('@/components/')) return { default: () => null };
      throw Error(`Unexpected component dependency: ${name}`);
    },
  });
  const selector = cartExports.default({ productId: 'gid://shopify/Product/1', productTitle: 'Synthetic ring',
    variants: [variant], priceRange: { minVariantPrice: variant.price, maxVariantPrice: variant.price } });
  const tree = selector.type(selector.props);
  const buttons = [];
  function visit(node) {
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (!node || typeof node !== 'object') return;
    if (node.type === 'button' && node.props.onClick?.name === 'handleAdd') buttons.push(node);
    visit(node.props?.children);
  }
  visit(tree);
  assert.equal(buttons.length, 2, 'Main and mobile sticky buttons use the same success handler');
  return { button: buttons[sticky ? 1 : 0], states, gaCalls };
}
for (const sticky of [false, true]) {
  let confirm;
  const t = tracker();
  const ui = cartButton({ meta: t, sticky, add: () => new Promise(resolve => { confirm = resolve; }) });
  const action = ui.button.props.onClick();
  assert.equal(t.state.calls.length, 0, 'A click or pending Shopify operation is not a cart addition');
  confirm(); await action; await tick();
  assert.equal(t.state.calls.length, 1, 'Exactly one Meta event per confirmed addition');
  assert.equal(t.state.calls[0][2].value, 125.5);
  assert.equal(ui.gaCalls.length, 1, 'Keep the existing Google cart event');
  assert.ok(ui.states.includes('added'));
}
{
  const t = tracker();
  const ui = cartButton({ meta: t, add: async () => { throw Error('Stock/network failure'); } });
  await ui.button.props.onClick(); await tick();
  assert.equal(t.state.calls.length, 0); assert.equal(ui.gaCalls.length, 0);
  assert.ok(ui.states.includes('error'));
}
for (const change of ['sold-out', 'size-required']) {
  const t = tracker(); let additions = 0;
  const variant = selectedVariant();
  if (change === 'sold-out') variant.availableForSale = false;
  else variant.selectedOptions = [{ name: 'Ring size', value: '6' }];
  const ui = cartButton({ meta: t, variant, add: async () => { additions++; } });
  await ui.button.props.onClick(); await tick();
  assert.equal(additions, 0); assert.equal(t.state.calls.length, 0);
}
{
  const t = tracker(); t.window.fbq = () => { throw Error('Meta blocked'); };
  const ui = cartButton({ meta: t, gaThrows: true, add: async () => {} });
  await ui.button.props.onClick(); await tick();
  assert.ok(ui.states.includes('added'));
  assert.ok(!ui.states.includes('error'), 'Blocked analytics must not show a failed cart');
}
console.log('PASS: confirmed adds only; main/mobile buttons; selected value/currency; marketing privacy; production guard; deferred SDK; blocked/missing tracking; failed adds; required sizes. No external requests or live cart writes.');
