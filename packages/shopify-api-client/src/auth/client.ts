// TODO: Review code style and roll out

import { RequestedTokenType, shopifyApi } from "@shopify/shopify-api";
import { Context, Effect, Layer } from "effect";

import { ShopifyAPIConfig } from "../config";

const make = Effect.gen(function* () {
  const config = yield* ShopifyAPIConfig;

  const {
    apiKey,
    apiSecretKey,
    scopes,
    hostName,
    hostScheme,
    apiVersion,
    isEmbeddedApp,
  } = yield* config.getConfig;

  // TODO: Extract and share?
  const shopify = shopifyApi({
    apiKey,
    apiSecretKey,
    scopes,
    hostName,
    hostScheme,
    apiVersion,
    isEmbeddedApp,
  });

  const exchangeToken = ({
    shop,
    sessionToken,
    online = false,
  }: {
    shop: string;
    sessionToken: string;
    online?: boolean;
  }) => {
    return Effect.tryPromise({
      try: () => {
        return shopify.auth.tokenExchange({
          shop,
          sessionToken,
          requestedTokenType: online
            ? RequestedTokenType.OnlineAccessToken
            : RequestedTokenType.OfflineAccessToken,
        });
      },
      catch: (error) => {
        console.error("Token exchange failed", error);

        return new Error("Token exchange failed");
      },
    });
  };

  return {
    exchangeToken,
  };
});

export class ShopifyAuthClient extends Context.Tag("ShopifyAuthClient")<
  ShopifyAuthClient,
  Effect.Effect.Success<typeof make>
>() {}

export const ShopifyAuthClientLive = Layer.effect(ShopifyAuthClient, make);
