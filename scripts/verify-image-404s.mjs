const urls = [
  'https://miozuki.co.nz/cdn/shop/files/HaloEarring_WhiteShirt_LookDown.jpg?v=1770688551',
  'https://miozuki.co.nz/cdn/shop/files/20250924_1652_Diamond_Earrings_remix_01k5x0xfx4fteaa9mnz2d8s8f5.jpg?v=1769145360',
  'https://miozuki.co.nz/cdn/shop/files/Untitled_design_1.jpg?v=1769910120',
  'https://miozuki.co.nz/cdn/shop/files/53c64b0a715f43d5a8dc5106068c9b9b.jpg?v=1770716108',
  'https://miozuki.co.nz/cdn/shop/files/Generated_Image_September_29_2025_-_3_54PM.jpg?v=1770716042',
  'https://cdn.shopify.com/s/files/1/0797/0819/3023/files/20260127_1710_GraduatedDiamondRing_remix_01kfyt8xy8e3wbh49te9mtxx16.jpg?v=1770687630',
  'https://cdn.shopify.com/s/files/1/0797/0819/3023/files/20250919_1159_LuxuryRingShowcase_remix_01k5fm6d68f2q8pqt0sw99gapc.jpg?v=1770687726',
  // sanity check: known-working image
  'https://cdn.shopify.com/s/files/1/0797/0819/3023/files/classic-moissanite-solitaire-ring-1-ct5-5479538.jpg?v=1773183970',
]

for (const u of urls) {
  try {
    const r = await fetch(u, { method: 'HEAD' })
    console.log(`${r.status} ${u.slice(0, 110)}`)
  } catch (e) {
    console.log(`ERR  ${e.message} ${u.slice(0, 110)}`)
  }
}
