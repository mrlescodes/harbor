import { Effect, Layer } from "effect";

import { ShopeeAPIClient } from "@harbor/shopee-api-client/api";
import { ShopeeAuthClient } from "@harbor/shopee-api-client/auth";
import { createShopeeAPIConfigLayer } from "@harbor/shopee-api-client/config";

import { env } from "~/env";
import { ShopeeTokenStorageLive } from "./token-storage";

/**
 * Config Layer
 */

const ShopeeAPIConfigLayerLive = createShopeeAPIConfigLayer({
  partnerId: env.SHOPEE_PARTNER_ID,
  partnerKey: env.SHOPEE_PARTNER_KEY,
  apiBaseUrl: env.SHOPEE_API_BASE_URL,
});

/**
 * Auth Client
 */

const ShopeeAuthClientLive = ShopeeAuthClient.Live.pipe(
  Layer.provide(ShopeeAPIConfigLayerLive),
  Layer.provide(ShopeeTokenStorageLive),
);

export const runWithShopeeAuthClient = <A, E>(
  effect: Effect.Effect<A, E, ShopeeAuthClient>,
) => Effect.provide(effect, ShopeeAuthClientLive);

/**
 * API Client
 */

const ShopeeAPIClientLive = ShopeeAPIClient.Live.pipe(
  Layer.provide(ShopeeAPIConfigLayerLive),
  Layer.provide(ShopeeAuthClientLive),
);

// Helper functions to run effects with the provided layers
export const runWithShopeeAPIClient = <A, E>(
  effect: Effect.Effect<A, E, ShopeeAPIClient>,
) => Effect.provide(effect, ShopeeAPIClientLive);
