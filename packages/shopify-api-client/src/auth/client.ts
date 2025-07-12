import "@shopify/shopify-api/adapters/node";

import {
  LogSeverity,
  RequestedTokenType,
  shopifyApi,
} from "@shopify/shopify-api";
import { Effect } from "effect";

import { ShopifyAPIConfig } from "../config";
import { ShopifySessionStorage } from "../session-storage";

export class ShopifyAuthClient extends Effect.Service<ShopifyAuthClient>()(
  "ShopifyAuthClient",
  {
    effect: Effect.gen(function* () {
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

      // TODO: Extract and share across package and have environment based log level
      const shopify = shopifyApi({
        apiKey,
        apiSecretKey,
        scopes,
        hostName,
        hostScheme,
        apiVersion,
        isEmbeddedApp,
        logger: {
          level: LogSeverity.Error,
        },
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
            catch: () => {
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

          // TODO: Use is expired from shared utils pacakge
          if (session.expires && session.expires < new Date()) {
            return yield* Effect.fail(new Error("Session expired for shop"));
          }

          if (!session.accessToken) {
            return yield* Effect.fail(
              new Error("No access token found for shop"),
            );
          }

          return session;
        }).pipe(Effect.scoped);
      };

      return {
        exchangeToken,
        getValidSession,
      };
    }),
  },
) {}
