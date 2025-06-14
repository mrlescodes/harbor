import { Context, Effect, Layer } from "effect";

import { PrismaClient } from "@harbor/database";

import { calculateExpiryDate } from "./utils";

const make = Effect.gen(function* () {
  const prisma = yield* PrismaClient;

  const storeToken = (
    shopId: number,
    tokens: { accessToken: string; refreshToken: string; expiresIn?: number },
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
        console.log(error);
        return new Error(`Failed to store token`);
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
