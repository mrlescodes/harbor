import "@shopify/shopify-api/adapters/node";

import { shopifyApi } from "@shopify/shopify-api";
import { Context, Effect, Layer } from "effect";

import type {
  FulfillmentInput,
  MetafieldDefinitionInput,
  OrderCreateOptionsInput,
  OrderCreateOrderInput,
  OrderIdentifierInput,
  ProductIdentifierInput,
} from "../types";
import { ShopifyAuthClient } from "../auth";
import { ShopifyAPIConfig } from "../config";
import {
  CREATE_FULFILLMENT,
  CREATE_METAFIELD_DEFINITION,
  CREATE_ORDER,
  DELETE_ORDER,
  FIND_ORDER_BY_IDENTIFIER,
  FIND_PRODUCT_BY_IDENTIFIER,
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

  // TODO: Extract and share across package
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
   * @see https://shopify.dev/docs/api/admin-graphql/latest/mutations/metafielddefinitioncreate
   */
  const createMetafieldDefinition = (
    shop: string,
    definition: MetafieldDefinitionInput,
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
        catch: () => {
          return new Error("Failed to create metafield definition");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/mutations/ordercreate
   */
  const createOrder = (
    shop: string,
    order: OrderCreateOrderInput,
    options?: OrderCreateOptionsInput,
  ) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const variables = {
        order,
        options,
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(CREATE_ORDER, { variables });
        },
        catch: () => {
          return new Error("Failed to create order");
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
        catch: () => {
          return new Error("Failed to delete order");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/queries/orderbyidentifier
   */
  const findOrderByIdentifier = (
    shop: string,
    identifier: OrderIdentifierInput,
  ) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const variables = {
        identifier,
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(FIND_ORDER_BY_IDENTIFIER, { variables });
        },
        catch: () => {
          return new Error("Failed to find order by identifier");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/mutations/fulfillmentcreate
   */
  const createFulfillment = (
    shop: string,
    fulfillment: FulfillmentInput,
    message?: string,
  ) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const variables = {
        fulfillment,
        message,
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(CREATE_FULFILLMENT, { variables });
        },
        catch: () => {
          return new Error("Failed to create fullfilment");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/queries/products
   */
  const getProducts = (
    shop: string,
    options?: {
      first?: number;
    },
  ) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const variables = {
        first: options?.first ?? 50,
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(GET_PRODUCTS, { variables });
        },
        catch: () => {
          return new Error("Failed to get products");
        },
      });

      return response;
    });
  };

  /**
   * @see https://shopify.dev/docs/api/admin-graphql/latest/queries/productbyidentifier
   */
  const findProductByIdentifier = (
    shop: string,
    identifier: ProductIdentifierInput,
  ) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const variables = {
        identifier,
      };

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(FIND_PRODUCT_BY_IDENTIFIER, { variables });
        },
        catch: () => {
          return new Error("Failed to find product by identifier");
        },
      });

      return response;
    });
  };

  return {
    createMetafieldDefinition,
    createOrder,
    deleteOrder,
    findOrderByIdentifier,
    createFulfillment,
    getProducts,
    findProductByIdentifier,
  };
});

export class ShopifyAPIClient extends Context.Tag("ShopifyAPIClient")<
  ShopifyAPIClient,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopifyAPIClient, make);
}
