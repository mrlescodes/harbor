import { Context, Effect, Layer } from "effect";

import { PrismaClient } from "@harbor/database";

const make = Effect.gen(function* () {
  const prisma = yield* PrismaClient;

  const createConnection = (shopeeShopId: number, shopifyShop: string) => {
    return Effect.tryPromise({
      try: () => {
        return prisma.shopeeConnection.create({
          data: {
            shopeeShopId,
            shopifyShop,
            isConnected: true,
          },
        });
      },
      catch: (error) => {
        console.log(error);
        return new Error(
          `Failed to create connection for Shopee shop ${shopeeShopId} and Shopify shop ${shopifyShop}`,
        );
      },
    });
  };

  const getShopifyShopByShopeeId = (shopeeShopId: number) => {
    return Effect.tryPromise({
      try: () => {
        return prisma.shopeeConnection.findUnique({
          where: {
            shopeeShopId,
          },
          select: {
            shopifyShop: true,
            isConnected: true,
          },
        });
      },
      catch: (error) => {
        console.log(error);
        return new Error(
          `Failed to retrieve Shopify shop for Shopee ID: ${shopeeShopId}`,
        );
      },
    });
  };

  const getConnectionByShopeeId = (shopeeShopId: number) => {
    return Effect.tryPromise({
      try: () => {
        return prisma.shopeeConnection.findUnique({
          where: {
            shopeeShopId,
          },
        });
      },
      catch: (error) => {
        console.log(error);
        return new Error(
          `Failed to retrieve connection for Shopee ID: ${shopeeShopId}`,
        );
      },
    });
  };

  const getConnectionByShopifyShop = (shopifyShop: string) => {
    return Effect.tryPromise({
      try: () => {
        return prisma.shopeeConnection.findUnique({
          where: {
            shopifyShop,
          },
        });
      },
      catch: (error) => {
        console.log(error);
        return new Error(
          `Failed to retrieve connection for Shopify shop: ${shopifyShop}`,
        );
      },
    });
  };

  return {
    createConnection,
    getShopifyShopByShopeeId,
    getConnectionByShopeeId,
    getConnectionByShopifyShop,
  };
});

export class ShopeeIntegration extends Context.Tag("ShopeeIntegration")<
  ShopeeIntegration,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopeeIntegration, make).pipe(
    Layer.provide(PrismaClient.Live),
  );
}
