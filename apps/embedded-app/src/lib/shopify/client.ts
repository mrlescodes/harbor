import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { Effect, Layer } from "effect";

import { ShopifyAuthClient } from "@harbor/shopify-api-client/auth";
import { createShopifyAPIConfigLayer } from "@harbor/shopify-api-client/config";

import { env } from "~/env";
import { ShopifySessionStorageLive } from "./session-storage";

/**
 * Config Layer
 */

const ShopifyAPIConfigLayerLive = createShopifyAPIConfigLayer({
  apiKey: env.NEXT_PUBLIC_SHOPIFY_API_KEY,
  apiSecretKey: env.SHOPIFY_API_SECRET,
  scopes: env.SHOPIFY_ACCESS_SCOPES.split(","),
  hostName: env.NEXT_PUBLIC_SHOPIFY_APP_URL.replace(/https?:\/\//, ""),
  hostScheme: "https",
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

/**
 * Auth Client
 */

const ShopifyAuthClientLive = ShopifyAuthClient.Live.pipe(
  Layer.provide(ShopifyAPIConfigLayerLive),
  Layer.provide(ShopifySessionStorageLive),
);

export const runWithShopifyAuthClient = <A, E>(
  effect: Effect.Effect<A, E, ShopifyAuthClient>,
) => Effect.provide(effect, ShopifyAuthClientLive);
