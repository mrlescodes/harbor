import { Session } from "@shopify/shopify-api";
import { Effect } from "effect";

import { mapPrismaErrorToDatabaseError, PrismaClient } from "@harbor/database";

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
          catch: mapPrismaErrorToDatabaseError,
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
            catch: mapPrismaErrorToDatabaseError,
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
