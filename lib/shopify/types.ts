export interface ShopifyMetafield {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyVideoSource {
  url: string;
  mimeType: string;
  format: string;
  height: number;
  width: number;
}

export type ShopifyMediaItem =
  | { mediaContentType: 'IMAGE'; image: ShopifyImage }
  | { mediaContentType: 'VIDEO'; sources: ShopifyVideoSource[]; previewImage: ShopifyImage | null };

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  descriptionHtml: string | null;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  media: { edges: { node: ShopifyMediaItem }[] };
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  variants: { edges: { node: ProductVariant }[] };
  tags: string[];
  productType: string | null;
  metafields: (ShopifyMetafield | null)[];
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  image: ShopifyImage | null;
  metafield: { value: string } | null;
  descriptionHtml: string | null;
  products: { edges: { node: Product }[] };
}

export interface ShopifyResponse<T> {
  data: T;
  errors?: { message: string }[];
}

export interface ArticleAuthor {
  name: string;
}

export interface Article {
  handle: string;
  title: string;
  publishedAt: string;
  excerpt: string | null;
  contentHtml?: string;
  image: ShopifyImage | null;
  tags: string[];
  author: ArticleAuthor;
}
