import { Session } from "@shopify/shopify-api";
import { Context, Effect, Layer } from "effect";

import { PrismaClient } from "@harbor/database";

const make = Effect.gen(function* () {
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
});

export class ShopifySessionStorage extends Context.Tag("ShopifySessionStorage")<
  ShopifySessionStorage,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopifySessionStorage, make).pipe(
    Layer.provide(PrismaClient.Live),
  );
}
