import "@shopify/shopify-api/adapters/node";

import { RequestedTokenType, shopifyApi } from "@shopify/shopify-api";
import { Context, Effect, Layer } from "effect";

import { ShopifyAPIConfig } from "../config";
import { ShopifySessionStorage } from "../session-storage";

const make = Effect.gen(function* () {
  const config = yield* ShopifyAPIConfig;
  const sessionStorage = yield* ShopifySessionStorage;

  const {
    apiKey,
    apiSecretKey,
    scopes,
    hostName,
    hostScheme,
    apiVersion,
    isEmbeddedApp,
  } = yield* config.getConfig;

  // TODO: Extract and share across clients
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
    return Effect.gen(function* () {
      const { session } = yield* Effect.tryPromise({
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

      yield* sessionStorage.storeSession(session);
    }).pipe(Effect.scoped);
  };

  const getValidSession = (shop: string) => {
    return Effect.gen(function* () {
      const sessionId = shopify.session.getOfflineId(shop);
      const session = yield* sessionStorage.loadSession(sessionId);

      if (!session) {
        return yield* Effect.fail(new Error("No session found for shop"));
      }

      if (session.expires && session.expires < new Date()) {
        return yield* Effect.fail(new Error("Session expired for shop"));
      }

      if (!session.accessToken) {
        return yield* Effect.fail(new Error("No access token found for shop"));
      }

      return session;
    }).pipe(Effect.scoped);
  };

  return {
    exchangeToken,
    getValidSession,
  };
});

export class ShopifyAuthClient extends Context.Tag("ShopifyAuthClient")<
  ShopifyAuthClient,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopifyAuthClient, make);
}
