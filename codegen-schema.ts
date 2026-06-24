// Introspects the live Shopify Storefront API and writes the schema SDL to
// lib/shopify/generated/storefront-schema.graphql (committed). Run only when the
// API version changes: `npm run codegen:schema`. Needs the Storefront token, so
// it reads .env.local. The everyday `npm run codegen` is offline (reads the
// committed SDL file) and needs none of this.
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import type { CodegenConfig } from '@graphql-codegen/cli';

const version = '2026-04';
const domain =
  process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !token) {
  throw new Error(
    'codegen:schema needs SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local',
  );
}

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    [`https://${domain}/api/${version}/graphql.json`]: {
      headers: { 'X-Shopify-Storefront-Access-Token': token },
    },
  },
  generates: {
    'lib/shopify/generated/storefront-schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
};

export default config;
