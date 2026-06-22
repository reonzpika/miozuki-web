export interface JudgeMeReviewer {
  name: string;
  verified_buyer: boolean;
}

export interface JudgeMeReviewPicture {
  urls: {
    original: string;
    small: string;
  };
}

export interface JudgeMeReview {
  id: number;
  title: string;
  body: string;
  rating: number;
  reviewer: JudgeMeReviewer;
  created_at: string;
  pictures: JudgeMeReviewPicture[];
  verified: 'unverified' | 'verified_review' | 'verified_buyer' | 'nothing' | string;
  // Visibility flags from the private-token API. It returns hidden, unpublished,
  // and spam-curated reviews too, so we filter on these before display.
  published?: boolean;
  hidden?: boolean;
  curated?: string;
}

export interface JudgeMeProductData {
  id: number;
  rating: number;
  reviews_count: number;
}

export interface JudgeMeReviewsData {
  product: JudgeMeProductData | null;
  reviews: JudgeMeReview[];
}

export interface RatingSummary {
  rating: number;
  count: number;
}
