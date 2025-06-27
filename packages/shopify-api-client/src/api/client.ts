import "@shopify/shopify-api/adapters/node";

import { shopifyApi } from "@shopify/shopify-api";
import { Context, Effect, Layer } from "effect";

import { ShopifyAuthClient } from "../auth";
import { ShopifyAPIConfig } from "../config";
import {
  CANCEL_ORDER,
  CREATE_METAFIELD_DEFINITION,
  CREATE_ORDER,
  DELETE_ORDER,
  FIND_ORDER_BY_CUSTOM_ID,
  FULFILL_ORDER,
  GET_PRODUCTS,
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

      const variables = { order };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(CREATE_ORDER, { variables });
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
   * @see https://shopify.dev/docs/api/admin-graphql/latest/mutations/ordercancel
   */
  const cancelOrder = (
    shop: string,
    orderId: string,
    options?: {
      notifyCustomer?: boolean;
      reason?:
        | "CUSTOMER"
        | "DECLINED"
        | "FRAUD"
        | "INVENTORY"
        | "OTHER"
        | "STAFF";
      refund?: boolean;
      restock?: boolean;
    },
  ) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const variables = {
        orderId,
        notifyCustomer: options?.notifyCustomer ?? false,
        reason: options?.reason ?? "OTHER",
        refund: options?.refund ?? false,
        restock: options?.restock ?? false,
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(CANCEL_ORDER, { variables });
        },
        catch: (error) => {
          console.error("Order cancellation failed:", error);
          return new Error("Failed to cancel order");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/mutations/orderdelete
   */
  const deleteOrder = (shop: string, orderId: string) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const variables = {
        orderId,
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(DELETE_ORDER, { variables });
        },
        catch: (error) => {
          console.error("Order cancellation failed:", error);
          return new Error("Failed to cancel order");
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

      const variables = {
        definition,
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(CREATE_METAFIELD_DEFINITION, { variables });
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

      const variables = {
        identifier: {
          customId,
        },
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(FIND_ORDER_BY_CUSTOM_ID, { variables });
        },
        catch: (error) => {
          console.error(error);
          return new Error("Failed to find order by custom ID");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/mutations/fulfillmentcreate
   */
  const fulfillOrder = (shop: string, fulfillmentOrderId: string) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const variables = {
        fulfillment: {
          lineItemsByFulfillmentOrder: { fulfillmentOrderId },
          notifyCustomer: false,
        },
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(FULFILL_ORDER, { variables });
        },
        catch: (error) => {
          console.error(error);
          return new Error("Failed to fulfill order");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/queries/products
   */
  const getProducts = (shop: string) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(GET_PRODUCTS);
        },
        catch: (error) => {
          console.error(error);
          return new Error("Failed to get products");
        },
      });

      return response;
    });
  };

  return {
    createOrder,
    cancelOrder,
    deleteOrder,
    createMetafieldDefinition,
    findOrderByCustomId,
    fulfillOrder,
    getProducts,
  };
});

export class ShopifyAPIClient extends Context.Tag("ShopifyAPIClient")<
  ShopifyAPIClient,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopifyAPIClient, make);
}
