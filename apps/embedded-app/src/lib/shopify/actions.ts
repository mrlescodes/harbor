"use server";

import { Effect } from "effect";

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
    });

    await RuntimeServer.runPromise(program);

    const store = await databaseService.findStore(shop);

    // If the store does not exist it's a first install. If it exists but is not active it's a re-install
    if (!store?.isActive) {
      await databaseService.initialiseStore(shop);
    }
  }
};
