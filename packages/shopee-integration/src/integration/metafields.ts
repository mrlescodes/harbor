import { Effect } from "effect";

import { ShopifyAPIClient } from "@harbor/shopify-api-client/api";

const SHOPEE_METAFIELD_DEFINITIONS = [
  {
    name: "Shopee Order ID",
    namespace: "harbor",
    key: "shopee_order_id",
    description:
      "Shopee marketplace order identifier for cross-platform order tracking",
    type: "single_line_text_field",
    ownerType: "ORDER",
    pin: true,
  },
];

export const setupShopeeMetafields = (shop: string) => {
  return Effect.gen(function* () {
    const shopifyApiClient = yield* ShopifyAPIClient;

    // Create Shopee metafield definitions
    for (const definition of SHOPEE_METAFIELD_DEFINITIONS) {
      yield* shopifyApiClient.createMetafieldDefinition(shop, definition);
    }
  });
};
