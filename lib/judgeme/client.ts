import type {
  JudgeMeProductData,
  JudgeMeReview,
  JudgeMeReviewsData,
  RatingSummary,
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
    const judgeMeProductId: number = productJson.product.id;

    const reviewsRes = await fetch(
      `${BASE}/reviews?api_token=${token}&shop_domain=${SHOP_DOMAIN}&product_id=${judgeMeProductId}&per_page=20&sort_by=created_at&sort_dir=desc`,
      { next: { revalidate: 60 } }
    );
    if (!reviewsRes.ok) return { product: null, reviews: [] };

    const reviewsJson = await reviewsRes.json();
    const reviews: JudgeMeReview[] = reviewsJson.reviews ?? [];

    const reviews_count = reviews.length;
    const rating =
      reviews_count > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews_count
        : 0;

    const product: JudgeMeProductData = {
      id: judgeMeProductId,
      rating,
      reviews_count,
    };

    return { product, reviews };
  } catch {
    return { product: null, reviews: [] };
  }
}

export async function getAllRatings(): Promise<Record<string, RatingSummary>> {
  const token = process.env.JUDGE_ME_PRIVATE_TOKEN;
  if (!token) return {};

  try {
    const res = await fetch(
      `${BASE}/reviews?api_token=${token}&shop_domain=${SHOP_DOMAIN}&per_page=250`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return {};

    const json = await res.json();
    const reviews: Array<{ rating: number; product_external_id: number }> =
      json.reviews ?? [];

    const acc: Record<string, { sum: number; count: number }> = {};
    for (const r of reviews) {
      const key = String(r.product_external_id);
      if (!acc[key]) acc[key] = { sum: 0, count: 0 };
      acc[key].sum += r.rating;
      acc[key].count += 1;
    }

    const result: Record<string, RatingSummary> = {};
    for (const [key, { sum, count }] of Object.entries(acc)) {
      result[key] = { rating: sum / count, count };
    }
    return result;
  } catch {
    return {};
  }
}
