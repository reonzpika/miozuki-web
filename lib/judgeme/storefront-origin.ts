/** Customer-facing storefront origin (Judge.me uses `#judgeme_product_reviews` on product URLs). */
export const STOREFRONT_ORIGIN = 'https://miozuki.co.nz';

export function storefrontProductJudgeMeReviewsUrl(productHandle: string): string {
  return `${STOREFRONT_ORIGIN}/products/${productHandle}#judgeme_product_reviews`;
}
