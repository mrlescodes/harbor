import { Effect, Layer } from "effect";

import { ShopifySessionStorage } from "@harbor/shopify-api-client/session-storage";

import type { PrismaClient } from "~/generated/prisma";
import { prisma } from "../database/prisma";

const make = (prisma: PrismaClient) => {
  // TODO: Encrypt tokens
  return ShopifySessionStorage.of({
    storeSession({ sessionId, shop }) {
      return Effect.tryPromise({
        try: () => {
          return prisma.shopifySession.upsert({
            where: { sessionId },
            update: { shop },
            create: {
              sessionId,
              shop,
            },
          });
        },
        catch: (error) => {
          console.error("Failed to store session:", error);
          return new Error("Failed to store session");
        },
      });
    },
  });
};

export const ShopifySessionStorageLive = Layer.succeed(
  ShopifySessionStorage,
  make(prisma),
);
