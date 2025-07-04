"use server";

import { Effect } from "effect";

import {
  setupShopeeMetafields,
  ShopeeIntegration,
} from "@harbor/shopee-integration/integration";
import { ShopifyAPIClient } from "@harbor/shopify-api-client/api";
import { ShopifyAuthClient } from "@harbor/shopify-api-client/auth";

import { databaseService } from "../database/database-service";
import { RuntimeServer } from "../runtime-server";

export const handleInitialLoad = async ({
  shop,
  idToken,
}: {
  shop: string | null;
  idToken: string | null;
}) => {
  if (idToken && shop) {
    const program = Effect.gen(function* () {
      const authClient = yield* ShopifyAuthClient;

      yield* authClient.exchangeToken({ shop, sessionToken: idToken });

      const store = yield* Effect.promise(() =>
        databaseService.findStore(shop),
      );

      // If the store does not exist it's a first install. If it exists but is not active it's a re-install
      if (!store?.isActive) {
        yield* Effect.promise(() => databaseService.initialiseStore(shop));
        yield* setupShopeeMetafields(shop);
      }
    });

    await RuntimeServer.runPromise(program);
  }
};

export const getProducts = async (shop: string) => {
  const program = Effect.gen(function* () {
    const shopifyAPIClient = yield* ShopifyAPIClient;

    const products = yield* shopifyAPIClient.getProducts(shop);

    return {
      success: true as const,
      products,
    };
  }).pipe(
    Effect.catchAll(() => {
      return Effect.succeed({
        success: false as const,
        error: "Failed to fetch products. Please try again later.",
      });
    }),
  );

  return await RuntimeServer.runPromise(program);
};

export const getProductMappingData = async (shop: string, id: string) => {
  const program = Effect.gen(function* () {
    const shopifyAPIClient = yield* ShopifyAPIClient;
    const shopeeIntegrationClient = yield* ShopeeIntegration;

    // Construct the Shopify GID
    const gid = `gid://shopify/Product/${id}`;

    // 1. Fetch product details from Shopify
    const shopifyResult = yield* shopifyAPIClient.findProductById(shop, gid);
    const shopifyProduct = shopifyResult?.data?.productByIdentifier;

    if (!shopifyProduct?.id) {
      return yield* Effect.fail(
        new Error("Shopify product not found or missing ID."),
      );
    }

    // 2. Fetch marketplace mappings
    const marketplaceMappings =
      yield* shopeeIntegrationClient.getMappingsByShopifyIds([
        { shopifyProductId: shopifyProduct.id },
      ]);

    // 3. Extract marketplace product ID (same for all variants)
    const marketplaceProductId =
      marketplaceMappings.length > 0
        ? marketplaceMappings[0].marketplaceProductId
        : null;

    // 4. Transform and merge data
    const variants = shopifyProduct.variants.edges.map(({ node: variant }) => {
      // Find existing mapping for this variant
      const existingMapping = marketplaceMappings.find(
        (mapping) => mapping.shopifyVariantId === variant.id,
      );

      return {
        shopifyVariantId: variant.id,
        shopifyVariantTitle: variant.title,
        marketplaceVariantId: existingMapping?.marketplaceVariantId ?? "",

        // UI helper
        hasExistingMapping: !!existingMapping,
      };
    });

    // 5. Calculate summary statistics
    const mappedVariants = variants.filter((v) => v.hasExistingMapping).length;
    const hasAnyMappings = mappedVariants > 0;

    const data = {
      // Flattened product info
      shopifyProductId: shopifyProduct.id,
      shopifyProductHandle: shopifyProduct.handle,
      shopifyProductTitle: shopifyProduct.title,
      hasOnlyDefaultVariant: shopifyProduct.hasOnlyDefaultVariant,

      // Lifted marketplace product ID
      marketplaceProductId: marketplaceProductId,

      // Product-level mapping status
      hasMarketplaceMapping: hasAnyMappings,

      // Processed variants
      variants,

      // Summary stats
      totalVariants: variants.length,
      mappedVariants,
      unmappedVariants: variants.length - mappedVariants,
    };

    return {
      success: true as const,
      result: data,
    };
  }).pipe(
    Effect.catchAll((error) => {
      console.error("Error in findProductById server action:", error);
      return Effect.succeed({
        success: false as const,
        error:
          error instanceof Error
            ? error.message
            : "Failed to find product by id due to an unexpected error.",
      });
    }),
  );

  return await RuntimeServer.runPromise(program);
};
