// Storefront GraphQL operations. Fragments are inlined (not interpolated) so the
// `/* GraphQL */` literals are statically parseable by graphql-codegen, which
// validates every field against the 2026-04 schema. See codegen.ts and the repo
// CLAUDE.md "GraphQL codegen" section. Keep each query a self-contained string.

export const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          featuredImage { url altText width height }
          images(first: 2) {
            edges { node { url altText width height } }
          }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          tags
          productType
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE = /* GraphQL */ `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      tags
      productType
      featuredImage { url altText width height }
      images(first: 10) {
        edges { node { url altText width height } }
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
              image { url altText width height }
            }
          }
        }
      }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
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
`;

export const GET_COLLECTIONS = /* GraphQL */ `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image { url altText width height }
          metafield(namespace: "custom", key: "intro") { value }
        }
      }
    }
  }
`;

export const GET_BLOG_ARTICLES = /* GraphQL */ `
  query GetBlogArticles($blogHandle: String!, $first: Int!) {
    blog(handle: $blogHandle) {
      articles(first: $first) {
        edges {
          node {
            handle
            title
            publishedAt
            excerpt
            image { url altText width height }
            tags
          }
        }
      }
    }
  }
`;

export const GET_ARTICLE_BY_HANDLE = /* GraphQL */ `
  query GetArticleByHandle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        title
        publishedAt
        contentHtml
        excerpt
        image { url altText width height }
        tags
      }
    }
  }
`;

export const GET_COLLECTION_BY_HANDLE = /* GraphQL */ `
  query GetCollectionByHandle($handle: String!, $productsFirst: Int!, $after: String) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      image { url altText width height }
      metafield(namespace: "custom", key: "intro") { value }
      products(first: $productsFirst, after: $after, sortKey: COLLECTION_DEFAULT) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            handle
            title
            featuredImage { url altText width height }
            images(first: 2) {
              edges { node { url altText width height } }
            }
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            tags
            productType
          }
        }
      }
    }
  }
`;
