import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { Layer, ManagedRuntime } from "effect";

import { ShopeeAPIClient } from "@harbor/shopee-api-client/api";
import { ShopeeAuthClient } from "@harbor/shopee-api-client/auth";
import { createShopeeAPIConfigLayer } from "@harbor/shopee-api-client/config";
import { ShopeeTokenStorage } from "@harbor/shopee-api-client/token-storage";
import { ShopeeIntegration } from "@harbor/shopee-integration/integration";
import { ShopifyAPIClient } from "@harbor/shopify-api-client/api";
import { ShopifyAuthClient } from "@harbor/shopify-api-client/auth";
import { createShopifyAPIConfigLayer } from "@harbor/shopify-api-client/config";
import { ShopifySessionStorage } from "@harbor/shopify-api-client/session-storage";

import { env } from "~/env";

/**
 * Shopee Services
 */

const ShopeeAPIConfigLayerLive = createShopeeAPIConfigLayer({
  partnerId: env.SHOPEE_PARTNER_ID,
  partnerKey: env.SHOPEE_PARTNER_KEY,
  apiBaseUrl: env.SHOPEE_API_BASE_URL,
});

export const ShopeeAuthClientLive = ShopeeAuthClient.Live.pipe(
  Layer.provide(ShopeeAPIConfigLayerLive),
  Layer.provide(ShopeeTokenStorage.Live),
);

export const ShopeeAPIClientLive = ShopeeAPIClient.Live.pipe(
  Layer.provide(ShopeeAPIConfigLayerLive),
  Layer.provide(ShopeeAuthClientLive),
);

/**
 * Shopify Services
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

const ShopifyAuthClientLive = ShopifyAuthClient.Live.pipe(
  Layer.provide(ShopifyAPIConfigLayerLive),
  Layer.provide(ShopifySessionStorage.Live),
);

export const ShopifyAPIClientLive = ShopifyAPIClient.Live.pipe(
  Layer.provide(ShopifyAPIConfigLayerLive),
  Layer.provide(ShopifyAuthClientLive),
);

/**
 * Main Layer
 */

const MainLayer = Layer.mergeAll(
  ShopeeAuthClientLive,
  ShopeeAPIClientLive,
  ShopeeIntegration.Live,

  ShopifyAuthClientLive,
  ShopifyAPIClientLive,
);

export const RuntimeServer = ManagedRuntime.make(MainLayer);
