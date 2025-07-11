import { ApiType, pluckConfig, preset } from "@shopify/api-codegen-preset";

export default {
  // For syntax highlighting / auto-complete when writing operations
  schema: "https://shopify.dev/admin-graphql-direct-proxy/2025-07", // TODO: Check version
  documents: ["./**/*.{js,ts,jsx,tsx}"],
  projects: {
    default: {
      // For type extraction
      schema: "https://shopify.dev/admin-graphql-direct-proxy/2025-07", // TODO: Check version
      documents: ["./**/*.{js,ts,jsx,tsx}"],
      extensions: {
        codegen: {
          // Enables support for `#graphql` tags, as well as `/* GraphQL */`
          pluckConfig,
          generates: {
            "./src/types/admin.schema.json": {
              plugins: ["introspection"],
              config: { minify: true },
            },
            "./src/types/admin.types.ts": {
              plugins: ["typescript"],
            },
            "./src/types/admin.generated.ts": {
              preset,
              presetConfig: {
                apiType: ApiType.Admin,
              },
            },
          },
        },
      },
    },
  },
};
