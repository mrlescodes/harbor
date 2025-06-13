import { Context, Effect, Layer } from "effect";

import { PrismaClient } from "@harbor/database";

/**
 * TODO: Move to utils package
 * Helper function to calculate token expiration date
 */
const calculateExpiryDate = (expiresIn?: number): Date => {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + (expiresIn ?? 3600));
  return expiresAt;
};

const make = Effect.gen(function* () {
  const prisma = yield* PrismaClient;

  return {
    storeToken: (
      shopId: number,
      tokens: { accessToken: string; refreshToken: string; expiresIn?: number },
    ) => {
      return Effect.tryPromise({
        try: () => {
          return prisma.shopeeConnection.upsert({
            where: { shopeeShopId: shopId },
            update: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              tokenExpiresAt: calculateExpiryDate(tokens.expiresIn),
            },
            create: {
              shopeeShopId: shopId,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              tokenExpiresAt: calculateExpiryDate(tokens.expiresIn),
            },
          });
        },
        catch: (error) => {
          console.log(error);
          return new Error(`Failed to store token`);
        },
      });
    },

    getToken: (shopId: number) => {
      return Effect.gen(function* () {
        const connection = yield* Effect.tryPromise({
          try: () => {
            return prisma.shopeeConnection.findUnique({
              where: { shopeeShopId: shopId },
            });
          },
          catch: (error) => {
            console.log(error);
            return new Error(`Failed to get token`);
          },
        });

        if (!connection) {
          return yield* Effect.fail(
            new Error(`No token found for Shopee shop ID: ${shopId}`),
          );
        }

        return {
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
          expiresAt: connection.tokenExpiresAt,
        };
      });
    },

    clearToken: (shopId: number) => {
      return Effect.tryPromise({
        try: () => {
          return prisma.shopeeConnection.update({
            where: { shopeeShopId: shopId },
            data: { connected: false },
          });
        },
        catch: (error) => {
          console.log(error);
          return new Error(`Failed to clear token`);
        },
      });
    },
  };
});

export class ShopeeTokenStorage extends Context.Tag("ShopTokenStorage")<
  ShopeeTokenStorage,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopeeTokenStorage, make).pipe(
    Layer.provide(PrismaClient.Live),
  );
}
