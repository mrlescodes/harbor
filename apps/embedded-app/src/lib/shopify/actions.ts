"use server";

import { Effect } from "effect";

import { setupShopeeMetafields } from "@harbor/shopee-integration/integration";
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

export const findProductById = async (shop: string, id: string) => {
  const program = Effect.gen(function* () {
    const shopifyAPIClient = yield* ShopifyAPIClient;

    // TODO: Build shopify GUID util
    const gid = `gid://shopify/Product/${id}`;
    const result = yield* shopifyAPIClient.findProductById(shop, gid);

    return {
      success: true as const,
      result,
    };
  }).pipe(
    Effect.catchAll(() => {
      return Effect.succeed({
        success: false as const,
        error: "Failed to find product by id.",
      });
    }),
  );

  return await RuntimeServer.runPromise(program);
};
