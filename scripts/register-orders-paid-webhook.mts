/**
 * Registers the orders/paid webhook subscription that feeds
 * app/api/webhooks/shopify/orders-paid/route.ts.
 *
 * This is a LIVE, PERSISTENT change to the Shopify store's webhook
 * configuration. Defaults to a dry run (lists existing subscriptions and
 * shows what would be created, creates nothing). Pass --create to actually
 * register it. Per this repo's standing rule, do not run with --create
 * without a separate explicit go-ahead from Ryo.
 *
 * Usage:
 *   npx tsx scripts/register-orders-paid-webhook.mts            # dry run
 *   npx tsx scripts/register-orders-paid-webhook.mts --create   # live
 *
 * Requires in .env.local:
 *   SHOPIFY_STORE_DOMAIN
 *   SHOPIFY_ADMIN_CLIENT_ID
 *   SHOPIFY_ADMIN_CLIENT_SECRET
 *   WEBHOOK_CALLBACK_URL (defaults to https://www.miozuki.co.nz/api/webhooks/shopify/orders-paid)
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET
const CALLBACK_URL =
  process.env.WEBHOOK_CALLBACK_URL ?? 'https://www.miozuki.co.nz/api/webhooks/shopify/orders-paid'
const API = `https://${DOMAIN}/admin/api/2024-10/graphql.json`
const CREATE = process.argv.includes('--create')

if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET')
  process.exit(1)
}

async function fetchAdminToken(): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
  })
  const r = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!r.ok) throw new Error(`Token exchange failed: ${r.status} ${await r.text()}`)
  const j: { access_token: string } = await r.json()
  return j.access_token
}

type GQL<T> = { data?: T; errors?: { message: string }[] }

async function gql<T>(token: string, query: string, variables: object = {}): Promise<T> {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const j: GQL<T> = await r.json()
  if (j.errors?.length) throw new Error(j.errors.map((e) => e.message).join('; '))
  return j.data!
}

async function main() {
  const token = await fetchAdminToken()

  const existing = await gql<{
    webhookSubscriptions: { edges: { node: { id: string; topic: string; endpoint: { __typename: string; callbackUrl?: string } } }[] }
  }>(
    token,
    `query { webhookSubscriptions(first: 50, topics: [ORDERS_PAID]) {
      edges { node { id topic endpoint { __typename ... on WebhookHttpEndpoint { callbackUrl } } } }
    } }`
  )

  console.log(`Existing ORDERS_PAID subscriptions (${existing.webhookSubscriptions.edges.length}):`)
  for (const { node } of existing.webhookSubscriptions.edges) {
    console.log(`  ${node.id} -> ${node.endpoint.callbackUrl ?? '(non-HTTP endpoint)'}`)
  }

  const alreadyRegistered = existing.webhookSubscriptions.edges.some(
    ({ node }) => node.endpoint.callbackUrl === CALLBACK_URL
  )
  if (alreadyRegistered) {
    console.log(`\nAlready registered for ${CALLBACK_URL}. Nothing to do.`)
    return
  }

  console.log(`\n${CREATE ? 'Creating' : 'Would create (dry run, pass --create to actually register)'}:`)
  console.log(`  topic: ORDERS_PAID`)
  console.log(`  callbackUrl: ${CALLBACK_URL}`)
  console.log(`  format: JSON`)

  if (!CREATE) {
    console.log('\nDry run only, no changes made. Re-run with --create to register live.')
    return
  }

  const result = await gql<{
    webhookSubscriptionCreate: {
      webhookSubscription: { id: string } | null
      userErrors: { field: string[]; message: string }[]
    }
  }>(
    token,
    `mutation($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription { id }
        userErrors { field message }
      }
    }`,
    {
      topic: 'ORDERS_PAID',
      webhookSubscription: { callbackUrl: CALLBACK_URL, format: 'JSON' },
    }
  )

  if (result.webhookSubscriptionCreate.userErrors.length) {
    console.error('Failed:', result.webhookSubscriptionCreate.userErrors.map((e) => e.message).join('; '))
    process.exit(1)
  }

  console.log(`\nRegistered: ${result.webhookSubscriptionCreate.webhookSubscription?.id}`)
}

main().catch((e) => {
  console.error('Failed:', e.message)
  process.exit(1)
})
