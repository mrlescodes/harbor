import type { ApiVersion } from "@shopify/shopify-api";
import { Context, Effect, Layer } from "effect";

// TODO: Convert to Effect config / service?

export interface ShopifyAPIConfigParams {
  apiKey: string;
  apiSecretKey: string;
  scopes: string[];
  hostName: string;
  hostScheme: "https";
  apiVersion: ApiVersion;
  isEmbeddedApp: boolean;
}

export class ShopifyAPIConfig extends Context.Tag("ShopifyAPIConfig")<
  ShopifyAPIConfig,
  {
    readonly getConfig: Effect.Effect<ShopifyAPIConfigParams>;
  }
>() {}

export const createShopifyAPIConfigLayer = (config: ShopifyAPIConfigParams) => {
  return Layer.succeed(
    ShopifyAPIConfig,
    ShopifyAPIConfig.of({
      getConfig: Effect.succeed(config),
    }),
  );
};
