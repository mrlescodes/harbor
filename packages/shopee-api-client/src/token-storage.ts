import { Context, Effect, Layer } from "effect";

import { PrismaClient } from "@harbor/database";

import { calculateExpiryDate } from "./utils";

const make = Effect.gen(function* () {
  const prisma = yield* PrismaClient;

  const storeToken = (
    shopId: number,
    tokens: { accessToken: string; refreshToken: string; expiresIn: number },
  ) => {
    return Effect.tryPromise({
      try: () => {
        return prisma.shopeeApiCredentials.upsert({
          where: { shopId: shopId },
          update: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expires: calculateExpiryDate(tokens.expiresIn),
          },
          create: {
            shopId,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expires: calculateExpiryDate(tokens.expiresIn),
          },
        });
      },
      catch: (error) => {
        console.error("Database error storing Shopee API credentials:", error);
        return new Error(
          `Failed to store Shopee API credentials for shop ID ${shopId}`,
        );
      },
    });
  };

  const getToken = (shopId: number) => {
    return Effect.gen(function* () {
      const connection = yield* Effect.tryPromise({
        try: () => {
          return prisma.shopeeApiCredentials.findUnique({
            where: { shopId },
          });
        },
        catch: (error) => {
          console.error(
            "Database error retrieving Shopee API credentials:",
            error,
          );
          return new Error(
            `Failed to retrieve Shopee API credentials for shop ID ${shopId}`,
          );
        },
      });

      if (!connection) {
        return yield* Effect.fail(
          new Error(`No Shopee API credentials found for shop ID ${shopId}`),
        );
      }

      return {
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken,
        expires: connection.expires,
      };
    });
  };

  return {
    storeToken,
    getToken,
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
