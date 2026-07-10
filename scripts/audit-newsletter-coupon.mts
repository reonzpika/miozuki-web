/**
 * Audit the newsletter-signup -> $15-off-coupon flow (Klaviyo "Welcome Series",
 * id UedWLp, list X3bZhc). Read-only: makes GET requests to Klaviyo only, never
 * writes anything. For every current member of the newsletter list, checks
 * whether Klaviyo's own event log shows an actual "Received Email" event
 * (real send history, not inferred from consent status), and flags anyone
 * suppressed (bounce/spam/prior unsubscribe silently blocks all sends
 * regardless of list membership).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/audit-newsletter-coupon.mts
 *
 * Requires in .env.local:
 *   KLAVIYO_PRIVATE_KEY
 *   KLAVIYO_LIST_ID
 *
 * Output: a markdown report at docs/audit/newsletter-coupon-audit-<date>.md
 *
 * Known limitation: Klaviyo's Events API does not reliably expose a
 * per-event flow/message-id filter via the public API, so "received_email"
 * below means "Klaviyo logged at least one Received Email event for this
 * profile" (any send, not provably the coupon message specifically). This
 * is still far stronger evidence than inferring from list/consent status
 * alone, but is not perfect message-level attribution -- said explicitly
 * here rather than silently overclaiming precision.
 */
import { writeFileSync, mkdirSync } from 'node:fs'

const API_KEY = process.env.KLAVIYO_PRIVATE_KEY
const LIST_ID = process.env.KLAVIYO_LIST_ID
const REVISION = '2024-10-15' // needed for the flow-triggers endpoint; newer than prod's 2024-02-15

if (!API_KEY || !LIST_ID) {
  console.error('Missing KLAVIYO_PRIVATE_KEY or KLAVIYO_LIST_ID in .env.local')
  process.exit(1)
}

const HEADERS = {
  accept: 'application/vnd.api+json',
  revision: REVISION,
  Authorization: `Klaviyo-API-Key ${API_KEY}`,
}

type Resource<A> = { id: string; type: string; attributes: A }
type JsonApiCollection<A> = { data: Resource<A>[]; links?: { next?: string | null } }
type JsonApiSingle<A> = { data: Resource<A> }

interface ListAttributes {
  opt_in_process: string
}
interface FlowAttributes {
  name: string
  status: string
  trigger_type: string
}
interface ProfileAttributes {
  email: string
  joined_group_at?: string | null
  created?: string | null
  subscriptions?: {
    email?: {
      marketing?: {
        consent?: string | null
        double_optin?: boolean | null
        suppression?: { reason?: string | null } | null
      }
    }
  }
}
interface MetricAttributes {
  name: string
}
interface EventAttributes {
  timestamp?: string
}

async function klaviyoGetJson<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: HEADERS })
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') ?? '2') * 1000
      console.log(`Rate limited, waiting ${wait}ms...`)
      await new Promise((r) => setTimeout(r, wait))
      continue
    }
    if (!res.ok) {
      throw new Error(`${res.status} ${url}: ${await res.text()}`)
    }
    return (await res.json()) as T
  }
  throw new Error(`Gave up after retries: ${url}`)
}

async function klaviyoGetAllPages<A>(url: string): Promise<Resource<A>[]> {
  const results: Resource<A>[] = []
  let next: string | null = url
  while (next) {
    const page: JsonApiCollection<A> = await klaviyoGetJson<JsonApiCollection<A>>(next)
    results.push(...page.data)
    next = page.links?.next ?? null
  }
  return results
}

type ListMember = {
  id: string
  email: string
  joined: string | null
  consent: string | null
  suppressionReason: string | null
}

async function main() {
  console.log(`Checking list ${LIST_ID} opt-in setting...`)
  const list = await klaviyoGetJson<JsonApiSingle<ListAttributes>>(
    `https://a.klaviyo.com/api/lists/${LIST_ID}`
  )
  const optInProcess = list.data.attributes.opt_in_process
  console.log(`  opt_in_process: ${optInProcess}`)

  console.log('Checking flows triggered by this list...')
  const flows = await klaviyoGetAllPages<FlowAttributes>(
    `https://a.klaviyo.com/api/lists/${LIST_ID}/flow-triggers?fields%5Bflow%5D=id,name,status,trigger_type`
  )
  for (const f of flows) {
    console.log(`  flow "${f.attributes.name}" (${f.id}): status=${f.attributes.status}, trigger=${f.attributes.trigger_type}`)
  }

  console.log('Fetching list members (paginated)...')
  const profiles = await klaviyoGetAllPages<ProfileAttributes>(
    `https://a.klaviyo.com/api/lists/${LIST_ID}/profiles?additional-fields%5Bprofile%5D=subscriptions&page%5Bsize%5D=100`
  )
  console.log(`  ${profiles.length} members`)

  const members: ListMember[] = profiles.map((p) => {
    const marketing = p.attributes.subscriptions?.email?.marketing
    return {
      id: p.id,
      email: p.attributes.email,
      joined: p.attributes.joined_group_at ?? p.attributes.created ?? null,
      consent: marketing?.consent ?? null,
      suppressionReason: marketing?.suppression?.reason ?? null,
    }
  })

  console.log('Resolving "Received Email" metric id...')
  const metrics = await klaviyoGetAllPages<MetricAttributes>('https://a.klaviyo.com/api/metrics')
  const receivedEmailMetric = metrics.find((m) => m.attributes.name === 'Received Email')
  if (!receivedEmailMetric) {
    throw new Error('Could not find "Received Email" metric on this account')
  }
  const metricId = receivedEmailMetric.id

  console.log('Fetching Received Email events for these profiles...')
  const receivedByProfile = new Set<string>()
  // Events API only filters by a single profile_id at a time, so batch per member.
  for (const m of members) {
    const events = await klaviyoGetAllPages<EventAttributes>(
      `https://a.klaviyo.com/api/events?filter=and(equals(profile_id,'${m.id}'),equals(metric_id,'${metricId}'))&page%5Bsize%5D=1`
    )
    if (events.length > 0) receivedByProfile.add(m.id)
  }

  type Row = ListMember & { status: string }
  const rows: Row[] = members.map((m) => {
    let status: string
    if (m.suppressionReason) status = `suppressed (${m.suppressionReason})`
    else if (m.consent !== 'SUBSCRIBED') status = `not subscribed (consent=${m.consent ?? 'unknown'})`
    else if (!receivedByProfile.has(m.id)) status = 'NEVER RECEIVED AN EMAIL'
    else status = 'received at least one email'
    return { ...m, status }
  })

  const affected = rows.filter((r) => r.status !== 'received at least one email')
  console.log(`\n${affected.length} of ${rows.length} members flagged (never received / suppressed / not subscribed).\n`)

  const date = new Date().toISOString().slice(0, 10)
  const lines: string[] = []
  lines.push(`# Newsletter coupon audit — ${date}`)
  lines.push('')
  lines.push(`List: ${LIST_ID} (opt_in_process: ${optInProcess})`)
  lines.push(`Flows triggered by list: ${flows.map((f) => `${f.attributes.name} (${f.attributes.status})`).join(', ')}`)
  lines.push('')
  lines.push(`${rows.length} total members, ${affected.length} flagged.`)
  lines.push('')
  lines.push('| Email | Joined | Status |')
  lines.push('|---|---|---|')
  for (const r of affected.sort((a, b) => (a.joined ?? '').localeCompare(b.joined ?? ''))) {
    lines.push(`| ${r.email} | ${r.joined ?? '?'} | ${r.status} |`)
  }
  lines.push('')
  lines.push('Note: "received at least one email" means Klaviyo logged a Received Email event for the profile at some point — not provably the coupon message specifically (see script header). Spot-check a few flagged rows directly in Klaviyo before acting on this list.')

  mkdirSync('docs/audit', { recursive: true })
  const outPath = `docs/audit/newsletter-coupon-audit-${date}.md`
  writeFileSync(outPath, lines.join('\n'))
  console.log(`Report written to ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
