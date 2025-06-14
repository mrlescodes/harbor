import "@shopify/shopify-api/adapters/node";

import { shopifyApi } from "@shopify/shopify-api";
import { Context, Effect, Layer } from "effect";

import { ShopifyAuthClient } from "../auth";
import { ShopifyAPIConfig } from "../config";

const CREATE_ORDER = /* GraphQL */ `
  mutation orderCreate(
    $order: OrderCreateOrderInput!
    $options: OrderCreateOptionsInput
  ) {
    orderCreate(order: $order, options: $options) {
      userErrors {
        field
        message
      }
      order {
        id
        totalTaxSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 5) {
          nodes {
            variant {
              id
            }
            id
            title
            quantity
            taxLines {
              title
              rate
              priceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

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

      const client = new shopify.clients.Graphql({
        session,
      });

      return { client, shop, session };
    });
  };

  const executeGraphQL = <T>(
    shop: string,
    query: string,
    variables?: Record<string, unknown>,
  ) => {
    return Effect.gen(function* () {
      const { client } = yield* getGraphQLClient(shop);

      const response = yield* Effect.tryPromise({
        try: () => {
          return client.request(query, { variables });
        },
        catch: (error) => {
          console.error(error);
          return new Error(`GraphQL request failed`);
        },
      });

      return response as T;
    });
  };

  return {
    // TODO: Response type
    createOrder: (shop: string, orderInput: Record<string, unknown>) => {
      return executeGraphQL(shop, CREATE_ORDER, orderInput);
    },
  };
});

export class ShopifyAPIClient extends Context.Tag("ShopifyAPIClient")<
  ShopifyAPIClient,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopifyAPIClient, make);
}
