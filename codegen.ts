// Offline, deterministic codegen for the Shopify Storefront API. Reads the
// committed schema SDL and validates every /* GraphQL */ query in lib/shopify
// against it (errors here if a field does not exist), then generates response
// types. Run with `npm run codegen`; also runs automatically before `next build`
// (see the "prebuild" script). The schema file is refreshed by `npm run
// codegen:schema` only on an API-version bump.
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'lib/shopify/generated/storefront-schema.graphql',
  documents: ['lib/shopify/**/*.ts', '!lib/shopify/generated/**'],
  ignoreNoDocuments: false,
  generates: {
    'lib/shopify/generated/storefront-types.ts': {
      // typescript-operations alone is self-contained (operation result +
      // variable types, plus the input/enum types they reference, with scalars
      // inlined). Adding the `typescript` plugin here duplicates the input/enum
      // declarations in the same file. This still validates every document
      // against the schema, which is the field-mismatch bug-catch.
      plugins: ['typescript-operations'],
      config: {
        useTypeImports: true,
        // Shopify Storefront custom scalars -> plain TS so nothing is `any`.
        scalars: {
          Color: 'string',
          DateTime: 'string',
          Decimal: 'string',
          HTML: 'string',
          JSON: 'string',
          URL: 'string',
          UnsignedInt64: 'string',
        },
      },
    },
  },
};

export default config;
