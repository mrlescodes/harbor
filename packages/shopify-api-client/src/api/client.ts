import "@shopify/shopify-api/adapters/node";

import { LogSeverity, shopifyApi } from "@shopify/shopify-api";
import { Effect } from "effect";

import { messageFromUnknown } from "@harbor/shared";

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
  mapShopifyError,
  ShopifyResponseError,
  ShopifyUserError,
} from "../errors";
import {
  CREATE_FULFILLMENT,
  CREATE_METAFIELD_DEFINITION,
  CREATE_ORDER,
  DELETE_ORDER,
  FIND_ORDER_BY_IDENTIFIER,
  FIND_PRODUCT_BY_IDENTIFIER,
  GET_PRODUCTS,
} from "./queries";

export class ShopifyAPIClient extends Effect.Service<ShopifyAPIClient>()(
  "ShopifyAPIClient",
  {
    effect: Effect.gen(function* () {
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
            catch: mapShopifyError,
          });

          if (response.errors) {
            return yield* new ShopifyResponseError({
              message: messageFromUnknown(response.errors),
              cause: response.errors,
            });
          }

          const result = response.data?.metafieldDefinitionCreate;

          if (!result) {
            return null;
          }

          if (result.userErrors.length > 0) {
            return yield* new ShopifyUserError({
              errors: result.userErrors,
            });
          }

          return result.createdDefinition?.id;
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
            catch: mapShopifyError,
          });

          if (response.errors) {
            return yield* new ShopifyResponseError({
              message: messageFromUnknown(response.errors),
              cause: response.errors,
            });
          }

          const result = response.data?.orderCreate;

          if (!result) {
            return null;
          }

          if (result.userErrors.length > 0) {
            return yield* new ShopifyUserError({
              errors: result.userErrors,
            });
          }

          return result.order?.id;
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
            catch: mapShopifyError,
          });

          if (response.errors) {
            return yield* new ShopifyResponseError({
              message: messageFromUnknown(response.errors),
              cause: response.errors,
            });
          }

          const result = response.data?.orderDelete;

          if (!result) {
            return null;
          }

          if (result.userErrors.length > 0) {
            return yield* new ShopifyUserError({
              errors: result.userErrors,
            });
          }

          return result.deletedId;
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
            catch: mapShopifyError,
          });

          if (response.errors) {
            return yield* new ShopifyResponseError({
              message: messageFromUnknown(response.errors),
              cause: response.errors,
            });
          }

          const result = response.data?.orderByIdentifier;

          if (!result) {
            return null;
          }

          return {
            ...result,
            fulfillmentOrders: result.fulfillmentOrders.edges.map((edge) => ({
              ...edge.node,
            })),
          };
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
            catch: mapShopifyError,
          });

          if (response.errors) {
            return yield* new ShopifyResponseError({
              message: messageFromUnknown(response.errors),
              cause: response.errors,
            });
          }

          const result = response.data?.fulfillmentCreate;

          if (!result) {
            return null;
          }

          if (result.userErrors.length > 0) {
            return yield* new ShopifyUserError({
              errors: result.userErrors,
            });
          }

          return result.fulfillment?.id;
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
            catch: mapShopifyError,
          });

          if (response.errors) {
            return yield* new ShopifyResponseError({
              message: messageFromUnknown(response.errors),
              cause: response.errors,
            });
          }

          const result = response.data?.products.nodes;

          if (!result) {
            return [];
          }

          return result.map((productNode) => ({
            ...productNode,
            variants: productNode.variants.nodes.map((variantNode) => ({
              ...variantNode,
            })),
          }));
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
            catch: mapShopifyError,
          });

          if (response.errors) {
            return yield* new ShopifyResponseError({
              message: messageFromUnknown(response.errors),
              cause: response.errors,
            });
          }

          const result = response.data?.productByIdentifier;

          if (!result) {
            return null;
          }

          return {
            ...result,
            variants: result.variants.edges.map((edge) => ({
              ...edge.node,
            })),
          };
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
    }),
  },
) {}
