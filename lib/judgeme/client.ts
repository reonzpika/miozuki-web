import type {
  JudgeMeProductData,
  JudgeMeReview,
  JudgeMeReviewsData,
} from './types';

const BASE = 'https://judge.me/api/v1';
const SHOP_DOMAIN = 'nassuu-px.myshopify.com';

export async function getProductReviews(
  shopifyGid: string
): Promise<JudgeMeReviewsData> {
  const token = process.env.JUDGE_ME_PRIVATE_TOKEN;
  if (!token) return { product: null, reviews: [] };

  const numericId = shopifyGid.split('/').pop() ?? '';
  if (!numericId) return { product: null, reviews: [] };

  try {
    const productRes = await fetch(
      `${BASE}/products/-1?api_token=${token}&shop_domain=${SHOP_DOMAIN}&external_id=${numericId}`,
      { next: { revalidate: 60 } }
    );
    if (!productRes.ok) return { product: null, reviews: [] };

    const productJson = await productRes.json();
    const product: JudgeMeProductData = {
      id: productJson.product.id,
      rating: productJson.product.rating ?? 0,
      reviews_count: productJson.product.reviews_count ?? 0,
    };

    if (product.reviews_count === 0) return { product, reviews: [] };

    const reviewsRes = await fetch(
      `${BASE}/reviews?api_token=${token}&shop_domain=${SHOP_DOMAIN}&product_id=${product.id}&per_page=20&sort_by=created_at&sort_dir=desc`,
      { next: { revalidate: 60 } }
    );
    if (!reviewsRes.ok) return { product, reviews: [] };

    const reviewsJson = await reviewsRes.json();
    const reviews: JudgeMeReview[] = reviewsJson.reviews ?? [];

    return { product, reviews };
  } catch {
    return { product: null, reviews: [] };
  }
}
