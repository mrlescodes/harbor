"use server";

import { Effect } from "effect";

import { ShopeeAuthClient } from "@harbor/shopee-api-client/auth";

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
