/**
 * Synthetic, no-order-required test of the Google Ads Data Manager upload
 * path (lib/admin/google-ads-data-manager.ts). Builds a fake order + gclid
 * and calls the real buildIngestEventBody/uploadConversionEvent functions
 * with validateOnly forced true (regardless of GOOGLE_ADS_DM_UPLOAD_ENABLED),
 * so auth + payload schema can be confirmed BEFORE a real order/ad-click is
 * spent testing it. Never touches real Ads data: validateOnly requests are
 * checked and discarded by Google, nothing is recorded.
 *
 * Usage:
 *   npx tsx scripts/test-data-manager-upload.mts
 *
 * Requires in .env.local:
 *   GOOGLE_ADS_DM_SA_CLIENT_EMAIL
 *   GOOGLE_ADS_DM_SA_PRIVATE_KEY
 *   GOOGLE_ADS_DM_OPERATING_ACCOUNT_ID
 *   GOOGLE_ADS_DM_CONVERSION_ACTION_ID
 */

import { GoogleAuth } from 'google-auth-library'

const INGEST_URL = 'https://datamanager.googleapis.com/v1/events:ingest'
const SCOPE = 'https://www.googleapis.com/auth/datamanager'

async function main() {
  // Dynamic import (not static) for the local modules: on this Node/tsx
  // combo, statically importing a named export from a relative .ts file as
  // the ENTRY script (not via eval) throws a spurious "does not provide an
  // export named" SyntaxError even though the export demonstrably exists
  // (confirmed via `tsx -e`). Dynamic import sidesteps whatever static-link
  // check is misfiring; not yet root-caused, noted here so a future cleanup
  // doesn't "fix" this back to a static import without re-testing.
  const { hashEmailForDataManager } = await import('../lib/google-ads-hash')
  const { buildIngestEventBody } = await import('../lib/admin/google-ads-data-manager')
  type OrderForUpload = Parameters<typeof buildIngestEventBody>[0]

  const order: OrderForUpload = {
    id: 999999001,
    createdAt: new Date(0).toISOString(),
    totalPrice: '9.00',
    currency: 'NZD',
    hashedEmail: hashEmailForDataManager('synthetic-test@miozuki.co.nz'),
  }
  const attribution = { gclid: 'TEST_SYNTHETIC_GCLID_DO_NOT_USE' }

  const body = buildIngestEventBody(order, attribution, { validateOnly: true })
  if (!body) {
    console.error(
      'buildIngestEventBody returned null: missing GOOGLE_ADS_DM_OPERATING_ACCOUNT_ID or GOOGLE_ADS_DM_CONVERSION_ACTION_ID.'
    )
    process.exit(1)
  }

  console.log('Request body:')
  console.log(JSON.stringify(body, null, 2))

  const clientEmail = process.env.GOOGLE_ADS_DM_SA_CLIENT_EMAIL
  const rawKey = process.env.GOOGLE_ADS_DM_SA_PRIVATE_KEY
  if (!clientEmail || !rawKey) {
    console.error('Missing GOOGLE_ADS_DM_SA_CLIENT_EMAIL or GOOGLE_ADS_DM_SA_PRIVATE_KEY.')
    process.exit(1)
  }

  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: rawKey.replace(/\\n/g, '\n') },
    scopes: [SCOPE],
  })
  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token
  if (!token) {
    console.error('Could not mint an access token from the service account credentials.')
    process.exit(1)
  }
  console.log('\nMinted access token OK.')

  const res = await fetch(INGEST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  })

  let responseBody: unknown
  try {
    responseBody = await res.json()
  } catch {
    responseBody = await res.text().catch(() => undefined)
  }

  console.log(`\nResponse: ${res.status} ${res.ok ? 'OK' : 'FAILED'}`)
  console.log(JSON.stringify(responseBody, null, 2))

  if (!res.ok) process.exit(1)
}

main().catch((e) => {
  console.error('Failed:', e instanceof Error ? e.message : e)
  process.exit(1)
})
