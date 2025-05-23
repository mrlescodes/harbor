// TODO: Notes this is the prefered service implementation shape

import { Effect, Layer } from "effect";

import { ShopeeTokenStorage } from "@harbor/shopee-api-client/token-storage";

import type { PrismaClient } from "~/generated/prisma";
import { prisma } from "../database/prisma";

/**
 * Helper function to calculate token expiration date
 */
const calculateExpiryDate = (expiresIn?: number): Date => {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + (expiresIn ?? 3600));
  return expiresAt;
};

// TODO: Encrypt / Decrupt access token
export const createShopeeTokenStorage = (prisma: PrismaClient) => {
  return ShopeeTokenStorage.of({
    storeToken: (
      shopId: number,
      tokens: { accessToken: string; refreshToken: string; expiresIn?: number },
    ) => {
      return Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            prisma.shopeeConnection.upsert({
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
            }),
          catch: (_) => new Error(`Failed to store token`),
        });
      });
    },

    getToken: (shopId: number) => {
      return Effect.gen(function* () {
        const connection = yield* Effect.tryPromise({
          try: () =>
            prisma.shopeeConnection.findUnique({
              where: { shopeeShopId: shopId },
            }),
          catch: (_) => new Error(`Failed to get token`),
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
      return Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            prisma.shopeeConnection.update({
              where: { shopeeShopId: shopId },
              data: { connected: false },
            }),
          catch: (_) => new Error(`Failed to clear token`),
        });
      });
    },
  });
};

export const ShopeeTokenStorageLive = Layer.succeed(
  ShopeeTokenStorage,
  createShopeeTokenStorage(prisma),
);
