import { Session } from "@shopify/shopify-api";
import { Effect } from "effect";

import { PrismaClient } from "@harbor/database";

export class ShopifySessionStorage extends Effect.Service<ShopifySessionStorage>()(
  "ShopifySessionStorage",
  {
    effect: Effect.gen(function* () {
      const prisma = yield* PrismaClient;

      const storeSession = (session: Session) => {
        return Effect.tryPromise({
          try: () => {
            return prisma.shopifySession.upsert({
              where: { sessionId: session.id },
              update: {
                shop: session.shop,
                state: session.state,
                isOnline: session.isOnline,
                scope: session.scope,
                expiresAt: session.expires,
                accessToken: session.accessToken,
              },
              create: {
                sessionId: session.id,
                shop: session.shop,
                state: session.state,
                isOnline: session.isOnline,
                scope: session.scope,
                expiresAt: session.expires,
                accessToken: session.accessToken,
              },
            });
          },
          catch: (error) => {
            console.error("Failed to store session:", error);
            return new Error("Failed to store session");
          },
        });
      };

      const loadSession = (sessionId: string) => {
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
            expires: sessionData.expiresAt ?? undefined,
            accessToken: sessionData.accessToken ?? undefined,
          });
        });
      };

      return {
        storeSession,
        loadSession,
      };
    }),

    dependencies: [PrismaClient.Default],
  },
) {}
