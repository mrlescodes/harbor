"use server";

import { Effect } from "effect";

import { ShopeeAuthClient } from "@harbor/shopee-api-client/auth";
import { ShopeeIntegration } from "@harbor/shopee-integration/integration";

import { env } from "~/env";
import { RuntimeServer } from "../runtime-server";

export const getShopeeAuthUrl = async (shop: string) => {
  const redirectUrl = `${env.NEXT_PUBLIC_SHOPIFY_APP_URL}/api/shopee/auth-callback/${shop}`;

  const program = Effect.gen(function* () {
    const shopeeAuthClient = yield* ShopeeAuthClient;

    return shopeeAuthClient.getAuthUrl(redirectUrl);
  });

  return RuntimeServer.runPromise(program);
};

export const createMarketplaceProductMapping = async (mapping: {
  shopifyProductId: string;
  shopifyVariantId: string;
  marketplaceProductId: number;
  marketplaceVariantId?: number;
}) => {
  const program = Effect.gen(function* () {
    const client = yield* ShopeeIntegration;

    const result = yield* client.createMarketplaceProductMapping(mapping);

    return {
      success: true as const,
      result,
    };
  }).pipe(
    Effect.catchAll(() => {
      return Effect.succeed({
        success: false as const,
        error: "Failed to create product mapping.",
      });
    }),
  );

  return RuntimeServer.runPromise(program);
};

// Exported function for external consumption (singular)
export const createMarketplaceProductMappings = async (
  mappings: {
    shopifyProductId: string;
    shopifyVariantId: string;
    marketplaceProductId: number;
    marketplaceVariantId?: number;
  }[],
) => {
  const program = Effect.gen(function* () {
    const client = yield* ShopeeIntegration;

    const result = yield* client.createMarketplaceProductMappings(mappings);

    return {
      success: true as const,
      result,
    };
  }).pipe(
    Effect.catchAll((error) => {
      // TODO: Logging
      return Effect.succeed({
        success: false as const,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }),
  );

  return RuntimeServer.runPromise(program);
};
