import { Effect, Layer } from "effect";

import { createShopeeAPIConfigLayer } from "@harbor/shopee-api-client/config";
import { ShopeeAuthClient } from "@harbor/shopee-api-client/auth";

import { env } from "@/env";

const ShopeeAPIConfigLayerLive = createShopeeAPIConfigLayer({
  partnerId: env.SHOPEE_PARTNER_ID,
  partnerKey: env.SHOPEE_PARTNER_KEY,
  apiBaseUrl: env.SHOPEE_API_BASE_URL,
});

const ShopeeAuthClientLive = ShopeeAuthClient.Live.pipe(
  Layer.provide(ShopeeAPIConfigLayerLive),
);

// Helper functions to run effects with the provided layers
export const runWithShopeeAuthClient = <A, E>(
  effect: Effect.Effect<A, E, ShopeeAuthClient>,
) => Effect.provide(effect, ShopeeAuthClientLive);
