import { Session } from "@shopify/shopify-api";
import { Effect, Layer } from "effect";

import { ShopifySessionStorage } from "@harbor/shopify-api-client/session-storage";

import type { PrismaClient } from "~/generated/prisma";
import { prisma } from "../database/prisma";

const make = (prisma: PrismaClient) => {
  // TODO: Encrypt tokens
  return ShopifySessionStorage.of({
    storeSession: (session: Session) => {
      return Effect.tryPromise({
        try: () => {
          return prisma.shopifySession.upsert({
            where: { sessionId: session.id },
            update: {
              shop: session.shop,
              state: session.state,
              isOnline: session.isOnline,
              scope: session.scope,
              expires: session.expires,
              accessToken: session.accessToken,
            },
            create: {
              sessionId: session.id,
              shop: session.shop,
              state: session.state,
              isOnline: session.isOnline,
              scope: session.scope,
              expires: session.expires,
              accessToken: session.accessToken,
            },
          });
        },
        catch: (error) => {
          console.error("Failed to store session:", error);
          return new Error("Failed to store session");
        },
      });
    },

    loadSession: (sessionId: string) => {
      return Effect.gen(function* () {
        const sessionData = yield* Effect.tryPromise({
          try: () => {
            return prisma.shopifySession.findUnique({
              where: { sessionId },
            });
          },
          catch: (error) => {
            console.error("Failed to load session:", error);
            return new Error("Failed to load session");
          },
        });

        if (!sessionData) {
          return null;
        }

        return new Session({
          id: sessionData.sessionId,
          shop: sessionData.shop,
          state: sessionData.state,
          isOnline: sessionData.isOnline,
          scope: sessionData.scope ?? undefined,
          expires: sessionData.expires ?? undefined,
          accessToken: sessionData.accessToken ?? undefined,
        });
      });
    },
  });
};

export const ShopifySessionStorageLive = Layer.succeed(
  ShopifySessionStorage,
  make(prisma),
);
