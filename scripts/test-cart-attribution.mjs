import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
function load(file, overrides = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX}}).outputText;
  const exports = {};
  vm.runInNewContext(code, {exports, require, process, setTimeout, clearTimeout, AbortController, AbortSignal, console, URL, URLSearchParams, ...overrides}, {filename: file});
  return exports;
}
async function main() {
  process.env.NEXT_PUBLIC_GA4_ID = 'G-TEST';
  let analytics='unknown', marketing='unknown';
  const store=new Map();
  const localStorage={getItem:key=>store.get(key)??null, setItem:(key,value)=>store.set(key,value), removeItem:key=>store.delete(key)};
  const browserWindow={location:{href:'https://www.miozuki.co.nz/products/ring?gclid=test-click&utm_source=google'}};
  const privacy={trackingPermission:purpose=>purpose==='analytics'?analytics:marketing, googleConsent:()=>({ad_user_data:marketing==='allowed'?'granted':'denied'})};
  const attribution=load('lib/attribution.ts',{require:name=>name==='./tracking-privacy'?privacy:require(name),window:browserWindow, localStorage,crypto:{randomUUID:()=> 'fallback-only'}});
  const attrs=()=>Object.fromEntries(attribution.getStoredAttributionAttributes().map(a=>[a.key,a.value]));
  attribution.captureAttributionOnLanding();
  browserWindow.location.href='https://www.miozuki.co.nz/products/second';
  analytics=marketing='allowed'; attribution.captureAttributionOnLanding();
  assert.equal(attrs()._gclid,'test-click','Retain original campaign while privacy is loading');
  assert.equal(attrs()._campaign_landing_path,'/products/ring');
  browserWindow.gtag=(_,id,field,callback)=>{assert.equal(id,'G-TEST');setTimeout(()=>callback(field==='client_id'?'123.456':1700000000),2);};
  await attribution.refreshAttributionIdentifiers(50);
  assert.equal(attrs()._ga_client_id,'123.456'); assert.equal(attrs()._ga_session_id,'1700000000');
  const savedCampaign=attrs()._campaign_captured_at;
  attribution.captureAttributionOnLanding(); assert.equal(attrs()._campaign_captured_at,savedCampaign,'Repeated captures do not extend campaign expiry');
  analytics=marketing='unknown'; assert.equal(attrs()._ga_client_id,''); assert.equal(attrs()._gclid,'','Unknown permission must not export previously stored identifiers');
  analytics='denied'; marketing='allowed'; assert.equal(attrs()._ga_client_id,''); assert.equal(attrs()._gclid,'test-click');
  analytics='allowed'; marketing='denied'; assert.equal(attrs()._gclid,'');
  store.set('miozuki-attribution',JSON.stringify({gaClientId:'123.456',gaSessionId:'123',gaIdsAt:'2000-01-01',gclid:'expired',campaignCapturedAt:'2000-01-01'}));
  analytics=marketing='allowed'; assert.equal(attrs()._gclid,''); assert.equal(attrs()._ga_client_id,'');
  browserWindow.gtag=()=>{}; const start=Date.now(); await attribution.refreshAttributionIdentifiers(25); assert.ok(Date.now()-start<200);
  delete browserWindow.gtag;
  let remote={id:'cart',checkoutUrl:'https://checkout.miozuki.co.nz/c',attributes:[{key:'gift',value:'keep'}]}, fail=false, mismatch=false, slow=false; const writes=[];
  const backend={getCart:async()=>remote,updateCartAttributes:async(id,attributes)=>{if(fail)throw Error('unavailable'); const snapshot=attributes.map(a=>({...a}));if(slow){slow=false;await new Promise(r=>setTimeout(r,2250));}writes.push(Object.fromEntries(snapshot.map(a=>[a.key,a.value])));remote={...remote,attributes:mismatch?[]:snapshot};return remote;}};
  const cart=load('lib/cart-attribution.ts',{require:name=>name==='./attribution'?attribution:backend,console:{warn:()=>{}}});
  assert.ok(await cart.persistCartAttribution('cart')); assert.equal(remote.attributes.find(a=>a.key==='gift').value,'keep');
  fail=true; assert.equal(await cart.persistCartAttribution('cart'),undefined);fail=false;
  mismatch=true;assert.equal(await cart.persistCartAttribution('cart'),undefined,'Read-back mismatch cannot count as confirmed');mismatch=false;
  slow=true; const first=cart.persistCartAttribution('cart');await new Promise(r=>setTimeout(r,10));analytics=marketing='denied';const withdrawal=cart.persistCartAttribution('cart');const deadlineStart=Date.now(); await Promise.all([first,withdrawal]);assert.ok(Date.now()-deadlineStart<2100,'Caller deadline keeps checkout available');await new Promise(r=>setTimeout(r,600));assert.equal(writes.at(-1)._analytics_permission,'denied','Queued withdrawal still drains after caller deadline');assert.equal(writes.at(-1)._gclid,'');
  const items=load('lib/ecommerce-items.ts'); assert.doesNotThrow(()=>items.analyticsItemId(undefined,undefined));assert.equal(items.analyticsItemId('gid://shopify/Product/1','gid://shopify/ProductVariant/2'),'shopify_ZZ_1_2');
  const events=load('lib/ga-events.ts',{require:name=>name==='@/lib/gtag'?{gaEvent:()=>{throw Error('blocked');}}:name==='@/lib/analytics-host'?{isProductionTrackingContext:()=>true}:items});assert.doesNotThrow(()=>events.trackBeginCheckout({}),'Incomplete telemetry cannot interrupt shopping');
  // Exercise real provider handlers with controlled hooks, not a mirrored algorithm.
  for(const failure of ['stock','network','missing']) {
    store.set('miozuki-cart-id','existing-basket');let creates=0;const effects=[];let value;
    const react={createContext:()=>({Provider:'provider'}),useCallback:fn=>fn,useContext:()=>{},useEffect:fn=>effects.push(fn),useState:initial=>[initial,()=>{}]};
    const provider=load('components/cart-provider.tsx',{localStorage,require:name=>name==='react'?react:name==='react/jsx-runtime'?{jsx:(_,props)=>{value=props.value;return props;}}:name==='@/lib/shopify/cart'?{getCart:async()=>failure==='missing'?null:{id:'existing-basket'},addCartLines:async()=>{throw Error(failure);},createCart:async()=>{creates++;return{id:'replacement',totalQuantity:1,checkoutUrl:'checkout'};}}:name==='@/lib/cart-attribution'?{persistCartAttribution:async()=>undefined}:{subscribeToPrivacy:()=>()=>{}}});
    provider.CartProvider({children:null});
    if(failure==='missing')await value.addToCart('variant'); else await assert.rejects(()=>value.addToCart('variant'));
    assert.equal(creates,failure==='missing'?1:0,'Replace only confirmed missing basket');
    if(failure!=='missing')assert.equal(store.get('miozuki-cart-id'),'existing-basket');
  }
  // Older supported browsers have AbortController but no AbortSignal.timeout.
  let readHangs = true;
  const compatible = load('lib/cart-attribution.ts', {AbortSignal: {}, setTimeout: (fn, ms) => setTimeout(fn, ms === 8000 ? 30 : ms),
    require: name => name === './attribution' ? attribution : {...backend, getCart: async () => readHangs ? new Promise(() => {}) : remote}, console: {warn: () => {}}});
  assert.equal(await compatible.persistCartAttribution('read-timeout'), undefined);
  readHangs = false;
  assert.ok(await compatible.persistCartAttribution('read-timeout'), 'A hung read must release the drain; works without AbortSignal.timeout');
  analytics = marketing = 'unknown';
  const queuedWindow = {dataLayer: [['existing', 'queue']]};
  const gtag = load('lib/gtag.ts', {window: queuedWindow, require: name => name === './tracking-privacy' ? privacy : require(name)});
  gtag.seedGtag('G-TEST'); assert.equal(queuedWindow.dataLayer[0][0], 'existing');
  assert.equal(queuedWindow.miozukiGoogleDestinations.size, 0, 'Unknown privacy must not queue destination configurations');
  marketing = 'allowed'; gtag.seedGtag('G-TEST'); assert.ok(queuedWindow.miozukiGoogleDestinations.has('AW-18302159906'));
  assert.equal(queuedWindow.miozukiGoogleDestinations.has('G-TEST'), false);
  analytics = 'allowed'; gtag.seedGtag('G-TEST'); assert.ok(queuedWindow.miozukiGoogleDestinations.has('G-TEST'));
  console.log('PASS: campaign/privacy transitions, valid and expired IDs, bounded waits, read-back, delayed withdrawal, malformed telemetry, and basket preservation.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
