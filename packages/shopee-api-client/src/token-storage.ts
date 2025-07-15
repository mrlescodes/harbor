import { Effect } from "effect";

import { mapPrismaErrorToDatabaseError, PrismaClient } from "@harbor/database";

import { calculateExpiryDate } from "./utils";

export class ShopeeTokenStorage extends Effect.Service<ShopeeTokenStorage>()(
  "ShopeeTokenStorage",
  {
    effect: Effect.gen(function* () {
      const prisma = yield* PrismaClient;

      const storeToken = (
        shopId: number,
        tokens: {
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
        },
      ) => {
        return Effect.tryPromise({
          try: () => {
            return prisma.shopeeApiCredentials.upsert({
              where: { shopId: shopId },
              update: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: calculateExpiryDate(tokens.expiresIn),
              },
              create: {
                shopId,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: calculateExpiryDate(tokens.expiresIn),
              },
            });
          },
          catch: mapPrismaErrorToDatabaseError,
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
            catch: mapPrismaErrorToDatabaseError,
          });

          if (!connection) {
            // TODO: Add domain errpr
            return yield* Effect.fail(
              new Error(
                `No Shopee API credentials found for shop ID ${shopId}`,
              ),
            );
          }

          return {
            accessToken: connection.accessToken,
            refreshToken: connection.refreshToken,
            expiresAt: connection.expiresAt,
          };
        });
      };

      return {
        storeToken,
        getToken,
      };
    }),

    dependencies: [PrismaClient.Default],
  },
) {}
