// Verify the PDP description update has been moved into Shopify.
// Loads every product on the local dev server and greps description text.

const OLD = 'Five moissanites trace a soft curve across sterling silver, reflecting a calm, timeless presence.'
const NEW = 'Five moissanites trace a curve across sterling silver band, reflecting a classy and elegant style.'

const base = 'http://localhost:3000'

const sources = ['/collections', '/collections/best-sellers', '/collections/moissanite-rings', '/collections/bridal-jewellery']
const handles = new Set()
for (const path of sources) {
  try {
    const html = await (await fetch(`${base}${path}`)).text()
    for (const m of html.matchAll(/\/products\/([a-z0-9-]+)/gi)) handles.add(m[1])
  } catch {}
}
console.log(`Discovered ${handles.size} product handles`)

const hits = { old: [], new: [], both: [] }
for (const h of handles) {
  try {
    const res = await fetch(`${base}/products/${h}`)
    const html = await res.text()
    const hasOld = html.includes(OLD)
    const hasNew = html.includes(NEW)
    if (hasOld && hasNew) hits.both.push(h)
    else if (hasOld) hits.old.push(h)
    else if (hasNew) hits.new.push(h)
  } catch (e) {
    console.log(`ERR ${h}: ${e.message}`)
  }
}

console.log('\n--- Results ---')
console.log(`Products with OLD text (Shopify NOT updated): ${hits.old.length}`)
hits.old.forEach(h => console.log(`  - ${h}`))
console.log(`Products with NEW text (Shopify updated): ${hits.new.length}`)
hits.new.forEach(h => console.log(`  - ${h}`))
console.log(`Products with BOTH (shouldn't happen): ${hits.both.length}`)
hits.both.forEach(h => console.log(`  - ${h}`))

if (hits.old.length > 0) {
  console.log('\nFAIL: Shopify still has the OLD description on at least one product.')
  process.exit(1)
} else if (hits.new.length === 0) {
  console.log('\nINCONCLUSIVE: Neither OLD nor NEW text found. Either Shopify uses different copy now, or text not on the surveyed handles.')
  process.exit(2)
} else {
  console.log('\nPASS: NEW text found, OLD text gone.')
}
