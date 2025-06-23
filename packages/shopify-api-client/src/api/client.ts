import "@shopify/shopify-api/adapters/node";

import { shopifyApi } from "@shopify/shopify-api";
import { Context, Effect, Layer } from "effect";

import { ShopifyAuthClient } from "../auth";
import { ShopifyAPIConfig } from "../config";
import {
  CREATE_METAFIELD_DEFINITION,
  CREATE_ORDER,
  FIND_ORDER_BY_CUSTOM_ID,
} from "./queries";

const make = Effect.gen(function* () {
  const config = yield* ShopifyAPIConfig;
  const authClient = yield* ShopifyAuthClient;

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

  const getGraphQLClient = (shop: string) => {
    return Effect.gen(function* () {
      const session = yield* authClient.getValidSession(shop);

      return new shopify.clients.Graphql({
        session,
      });
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/mutations/ordercreate
   */
  const createOrder = (shop: string, order: Record<string, unknown>) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(CREATE_ORDER, { variables: order });
        },
        catch: (error) => {
          console.error(error);
          return new Error("Failed to create order");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/mutations/metafielddefinitioncreate
   */
  const createMetafieldDefinition = (
    shop: string,
    definition: Record<string, unknown>,
  ) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(CREATE_METAFIELD_DEFINITION, {
            variables: { definition },
          });
        },
        catch: (error) => {
          console.error(error);
          return new Error("Failed to create metafield definition");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/queries/orderbyidentifier
   */
  const findOrderByCustomId = (
    shop: string,
    customId: {
      namespace: string;
      key: string;
      value: string;
    },
  ) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(FIND_ORDER_BY_CUSTOM_ID, {
            variables: {
              identifier: {
                customId,
              },
            },
          });
        },
        catch: (error) => {
          console.error(error);
          return new Error("Failed to find order by custom ID");
        },
      });

      return response;
    });
  };

  return {
    createOrder,
    createMetafieldDefinition,
    findOrderByCustomId,
  };
});

export class ShopifyAPIClient extends Context.Tag("ShopifyAPIClient")<
  ShopifyAPIClient,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopifyAPIClient, make);
}
