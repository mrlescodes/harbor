import { Effect } from "effect";

import { MetafieldOwnerType } from "@harbor/shopify-api-client";
import { ShopifyAPIClient } from "@harbor/shopify-api-client/api";

const SHOPEE_METAFIELD_DEFINITIONS = [
  {
    name: "Shopee Order ID",
    namespace: "harbor",
    key: "shopee_order_id",
    description:
      "Shopee marketplace order identifier for cross-platform order tracking",
    type: "id",
    ownerType: MetafieldOwnerType.Order,
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
