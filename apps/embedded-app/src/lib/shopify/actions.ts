"use server";

import { Effect } from "effect";

import { setupShopeeMetafields } from "@harbor/shopee-integration/integration";
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
