"use server";

import { env } from "~/env";
import { Effect } from "effect";

import { ShopeeAuthClient } from "@harbor/shopee-api-client/auth";

import { runWithShopeeAuthClient } from "./client";

export const getShopeeAuthUrl = async (shop: string) => {
  const redirectUrl = `${env.NEXT_PUBLIC_SHOPIFY_APP_URL}/api/shopee/auth-callback/${shop}`;

  const program = Effect.gen(function* () {
    const shopeeAuthClient = yield* ShopeeAuthClient;

    return shopeeAuthClient.getAuthUrl(redirectUrl);
  });

  const runnable = runWithShopeeAuthClient(program);

  return Effect.runPromise(runnable);
};
