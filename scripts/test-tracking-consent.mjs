import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
import { createHmac } from 'node:crypto';
const require = createRequire(import.meta.url);
function load(file, overrides = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText, { exports, require, process, console, Buffer, AbortSignal, ...overrides }, { filename: file });
  return exports;
}
process.env.SHOPIFY_ADMIN_CLIENT_SECRET = 'synthetic-secret';
process.env.GOOGLE_ADS_DM_OPERATING_ACCOUNT_ID = '123';
process.env.GOOGLE_ADS_DM_CONVERSION_ACTION_ID = '456';
process.env.GOOGLE_ADS_DM_UPLOAD_ENABLED = 'live';
const tasks = [], uploads = [], logs = [];
const webhook = load('app/api/webhooks/shopify/orders-paid/route.ts', {
  require: name => name === 'node:crypto' ? require(name) : name === 'next/server' ? {
    NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) }, after: fn => tasks.push(fn),
  } : name === '@/lib/google-ads-hash' ? { hashEmailForDataManager: () => 'synthetic-hash' } : {
    getUploadStage: () => 'live', buildIngestEventBody: () => ({ sensitive: 'not-for-logs' }),
    uploadConversionEvent: async (...args) => { uploads.push(args); return { ok: true, status: 200, body: { sensitive: 'not-for-logs' } }; },
  }, console: { log: value => logs.push(value), warn: () => {}, error: () => {} },
});
async function send(attributes, signature = true) {
  const raw = JSON.stringify({ id: 100, created_at: '2026-10-09T00:00:00Z', total_price: '300', currency: 'NZD',
    email: 'synthetic@example.test', note_attributes: attributes.map(([name, value]) => ({ name, value })) });
  return webhook.POST({ text: async () => raw, headers: { get: () => signature ? createHmac('sha256', 'synthetic-secret').update(raw).digest('base64') : 'invalid' } });
}
assert.equal((await send([], false)).status, 401);
for (const attrs of [[], [['_gclid', 'synthetic-click']], [['_marketing_permission', 'denied'], ['_ad_user_data_permission', 'allowed'], ['_gclid', 'synthetic-click']],
  [['_marketing_permission', 'allowed'], ['_ad_user_data_permission', 'allowed']]]) {
  assert.equal((await send(attrs)).status, 200);
  assert.equal(tasks.length, 0, 'Unknown/denied permission or absent click cannot schedule upload');
}
await send([['_marketing_permission', 'allowed'], ['_ad_user_data_permission', 'allowed'], ['_gclid', 'synthetic-click']]);
assert.equal(tasks.length, 1);
await tasks.shift()();
assert.equal(uploads.length, 1);
assert.equal(uploads[0][2], true);
assert.ok(!logs.join('').includes('synthetic-click'));
assert.ok(!logs.join('').includes('synthetic-hash'));
assert.ok(!logs.join('').includes('not-for-logs'));
const dm = load('lib/admin/google-ads-data-manager.ts', { require: () => ({ GoogleAuth: class {} }) });
assert.equal(await dm.uploadConversionEvent({}, {}), null, 'Upload defaults to no permission');
const body = dm.buildIngestEventBody({ id: 1, createdAt: '2026-10-09T00:00:00Z', totalPrice: '300', currency: 'NZD' }, {}, { validateOnly: true, consentAllowed: true });
assert.equal(body.consent.adUserData, 'CONSENT_GRANTED');
assert.equal(body.consent.adPersonalization, 'CONSENT_DENIED');
console.log('PASS: authenticated webhook consent/click eligibility, explicit upload permission and sanitised logging. No external request made.');
