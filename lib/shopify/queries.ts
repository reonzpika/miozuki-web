const IMAGE_FRAGMENT = `
  fragment ImageFragment on Image {
    url
    altText
    width
    height
  }
`;

const MONEY_FRAGMENT = `
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCard on Product {
    id
    handle
    title
    featuredImage { ...ImageFragment }
    images(first: 2) {
      edges { node { ...ImageFragment } }
    }
    priceRange {
      minVariantPrice { ...MoneyFragment }
      maxVariantPrice { ...MoneyFragment }
    }
    tags
    productType
  }
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

export const GET_PRODUCTS = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node { ...ProductCard }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      tags
      productType
      featuredImage { ...ImageFragment }
      images(first: 10) {
        edges { node { ...ImageFragment } }
      }
      media(first: 10) {
        edges {
          node {
            mediaContentType
            ... on Video {
              sources { url mimeType format height width }
              previewImage { url altText width height }
            }
            ... on MediaImage {
              image { ...ImageFragment }
            }
          }
        }
      }
      priceRange {
        minVariantPrice { ...MoneyFragment }
        maxVariantPrice { ...MoneyFragment }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            price { ...MoneyFragment }
            compareAtPrice { ...MoneyFragment }
            selectedOptions { name value }
          }
        }
      }
      metafields(identifiers: [
        { namespace: "custom", key: "what_is_included" }
        { namespace: "custom", key: "product_material" }
        { namespace: "custom", key: "product_details" }
      ]) {
        namespace
        key
        value
        type
      }
    }
  }
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

export const GET_COLLECTIONS = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image { ...ImageFragment }
          metafield(namespace: "custom", key: "intro") { value }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const GET_BLOG_ARTICLES = `
  query GetBlogArticles($blogHandle: String!, $first: Int!) {
    blog(handle: $blogHandle) {
      articles(first: $first) {
        edges {
          node {
            handle
            title
            publishedAt
            excerpt
            image { ...ImageFragment }
            tags
            author { name }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const GET_ARTICLE_BY_HANDLE = `
  query GetArticleByHandle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        title
        publishedAt
        contentHtml
        excerpt
        image { ...ImageFragment }
        tags
        author { name }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const GET_COLLECTION_BY_HANDLE = `
  query GetCollectionByHandle($handle: String!, $productsFirst: Int!) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      image { ...ImageFragment }
      metafield(namespace: "custom", key: "intro") { value }
      products(first: $productsFirst) {
        edges {
          node { ...ProductCard }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
