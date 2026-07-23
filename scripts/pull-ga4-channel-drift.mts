/**
 * Headless GA4 pull for growth-signals-watch (workstream C follow-on,
 * 2026-07-23). Replaces the live-browser fallback documented in
 * miozuki-brain/.claude/skills/growth-signals-watch/SKILL.md steps 3-4, now
 * that the GA4 service-account credential gap (vault task miozuki-20260712-001)
 * is fixed. Read-only against the GA4 Data API, never writes anywhere itself.
 *
 * Pulls, over a 90-day window ending today:
 *   1. AI Assistant and Referral channel: sessions, % of total, users,
 *      engagement rate, avg engagement time per session.
 *   2. Referral channel only, broken down by exact session source/medium
 *      (per the skill's standing rule: the Referral total is noise-dominated,
 *      only specific real external domains are the actual signal).
 *
 * Prints a ready-to-paste markdown block matching the existing
 * seo/emerging-channels-watch.md entry format, for a human (or a later pass
 * in the same session) to append and date-stamp deliberately. Never writes
 * to the brain repo itself, this script only knows about miozuki-web.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/pull-ga4-channel-drift.mts
 *
 * Requires in .env.local: GA_SA_CLIENT_EMAIL, GA_SA_PRIVATE_KEY, GA_PROPERTY_ID
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data'

const clientEmail = process.env.GA_SA_CLIENT_EMAIL
const rawKey = process.env.GA_SA_PRIVATE_KEY
const propertyId = process.env.GA_PROPERTY_ID

if (!clientEmail || !rawKey || !propertyId) {
  console.error('Missing GA_SA_CLIENT_EMAIL, GA_SA_PRIVATE_KEY, or GA_PROPERTY_ID in .env.local')
  process.exit(1)
}

const privateKey = rawKey.replace(/\\n/g, '\n')
const client = new BetaAnalyticsDataClient({
  credentials: { client_email: clientEmail, private_key: privateKey },
})
const property = `properties/${propertyId}`

function fmtDuration(seconds: number): string {
  const s = Math.round(seconds)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem === 0 ? `${m}m` : `${m}m ${rem}s`
}

async function main() {
  // ---- 1. Channel-level rows (all channels, so we can compute % of total) ----
  const [channelResp] = await client.runReport({
    property,
    dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'engagementRate' },
      { name: 'userEngagementDuration' },
    ],
  })

  const rows = channelResp.rows ?? []
  const totalSessions = rows.reduce((sum, r) => sum + Number(r.metricValues?.[0]?.value ?? 0), 0)

  const watched = ['AI Assistant', 'Referral']
  const channelTable = watched.map((name) => {
    const row = rows.find((r) => r.dimensionValues?.[0]?.value === name)
    if (!row) return { name, sessions: 0, pct: '0%', users: 0, engagementRate: '0%', avgEngagement: '0s' }
    const sessions = Number(row.metricValues?.[0]?.value ?? 0)
    const users = Number(row.metricValues?.[1]?.value ?? 0)
    const engagementRate = Number(row.metricValues?.[2]?.value ?? 0)
    const engagementDuration = Number(row.metricValues?.[3]?.value ?? 0)
    const avgEngagement = sessions > 0 ? engagementDuration / sessions : 0
    return {
      name,
      sessions,
      pct: totalSessions > 0 ? `${((sessions / totalSessions) * 100).toFixed(2)}%` : '0%',
      users,
      engagementRate: `${(engagementRate * 100).toFixed(2)}%`,
      avgEngagement: fmtDuration(avgEngagement),
    }
  })

  // ---- 2. Referral, broken down by exact source/medium ----
  const [referralResp] = await client.runReport({
    property,
    dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionSourceMedium' }],
    metrics: [{ name: 'sessions' }],
    dimensionFilter: {
      filter: {
        fieldName: 'sessionDefaultChannelGroup',
        stringFilter: { matchType: 'EXACT', value: 'Referral' },
      },
    },
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  })

  const referralRows = referralResp.rows ?? []
  const referralTotal = referralRows.reduce((sum, r) => sum + Number(r.metricValues?.[0]?.value ?? 0), 0)

  // ---- Print ready-to-paste markdown ----
  const today = new Date().toISOString().slice(0, 10)
  console.log(`### ${today} [pulled headlessly via the GA4 Data API, property ${propertyId}]\n`)
  console.log(`90-day window, ${totalSessions} total sessions:\n`)
  console.log('| Channel | Sessions | % of total | Users | Engagement rate | Avg engagement time |')
  console.log('|---|---|---|---|---|---|')
  for (const c of channelTable) {
    console.log(`| ${c.name} | ${c.sessions} | ${c.pct} | ${c.users} | ${c.engagementRate} | ${c.avgEngagement} |`)
  }
  console.log(`\n### Referral channel, broken down by real source/medium\n`)
  console.log(`Same 90-day window, ${referralTotal} total Referral sessions:\n`)
  console.log('| Source / medium | Sessions | % of Referral total |')
  console.log('|---|---|---|')
  for (const r of referralRows) {
    const sm = r.dimensionValues?.[0]?.value ?? '(unknown)'
    const sessions = Number(r.metricValues?.[0]?.value ?? 0)
    const pct = referralTotal > 0 ? `${((sessions / referralTotal) * 100).toFixed(2)}%` : '0%'
    console.log(`| \`${sm}\` | ${sessions} | ${pct} |`)
  }
  console.log(
    '\n(Real-vs-noise judgement per source is a human call, not automated here, per growth-signals-watch\'s standing rule that only genuine external domains like chatgpt.com count as signal.)'
  )
}

main().catch((err) => {
  console.error('GA4 pull failed:', err.message ?? err)
  process.exit(1)
})
