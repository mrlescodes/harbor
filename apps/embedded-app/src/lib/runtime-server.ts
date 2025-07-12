import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { Layer, Logger, ManagedRuntime } from "effect";

import { makeSentryLogger } from "@harbor/observability/sentry";
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
 * Observability
 */

const SentryLogger = makeSentryLogger({
  dsn: env.SENTRY_DSN,
});

const SentryLoggerLayer = Logger.replace(Logger.defaultLogger, SentryLogger);

/**
 * Shopee Services
 */

const ShopeeAPIConfigLayerLive = createShopeeAPIConfigLayer({
  partnerId: env.SHOPEE_PARTNER_ID,
  partnerKey: env.SHOPEE_PARTNER_KEY,
  apiBaseUrl: env.SHOPEE_API_BASE_URL,
});

export const ShopeeAuthClientLive = ShopeeAuthClient.Default.pipe(
  Layer.provide(ShopeeAPIConfigLayerLive),
  Layer.provide(ShopeeTokenStorage.Default),
);

export const ShopeeAPIClientLive = ShopeeAPIClient.Default.pipe(
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

const ShopifyAuthClientLive = ShopifyAuthClient.Default.pipe(
  Layer.provide(ShopifyAPIConfigLayerLive),
  Layer.provide(ShopifySessionStorage.Default),
);

export const ShopifyAPIClientLive = ShopifyAPIClient.Default.pipe(
  Layer.provide(ShopifyAPIConfigLayerLive),
  Layer.provide(ShopifyAuthClientLive),
);

/**
 * Main Layer
 */

const MainLayer = Layer.mergeAll(
  ShopeeAuthClientLive,
  ShopeeAPIClientLive,
  ShopeeIntegration.Default,

  ShopifyAuthClientLive,
  ShopifyAPIClientLive,

  SentryLoggerLayer,
);

export const RuntimeServer = ManagedRuntime.make(MainLayer);
