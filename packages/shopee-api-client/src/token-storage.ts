import { Effect } from "effect";

import { mapPrismaErrorToDatabaseError, PrismaClient } from "@harbor/database";

import { ShopeeCredentialsNotFoundError } from "./errors";
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
          const credentials = yield* Effect.tryPromise({
            try: () => {
              return prisma.shopeeApiCredentials.findUnique({
                where: { shopId },
              });
            },
            catch: mapPrismaErrorToDatabaseError,
          });

          if (!credentials) {
            return yield* new ShopeeCredentialsNotFoundError({ shopId });
          }

          return {
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken,
            expiresAt: credentials.expiresAt,
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
