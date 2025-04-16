import "@shopify/shopify-api/adapters/node";
import {
  shopifyApi,
  LATEST_API_VERSION,
  LogSeverity,
} from "@shopify/shopify-api";

import { env } from "@/env";

export const shopify = shopifyApi({
  apiKey: env.NEXT_PUBLIC_SHOPIFY_API_KEY,
  apiSecretKey: env.SHOPIFY_API_SECRET,
  scopes: env.SHOPIFY_ACCESS_SCOPES.split(","),
  hostName: env.NEXT_PUBLIC_SHOPIFY_APP_URL.replace(/https?:\/\//, ""),
  hostScheme: "https",
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  logger: {
    level:
      env.NODE_ENV === "development" ? LogSeverity.Debug : LogSeverity.Error,
  },
});
