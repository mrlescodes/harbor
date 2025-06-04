import type { Session } from "@shopify/shopify-api";
import type { Effect } from "effect";
import { Context } from "effect";

export class ShopifySessionStorage extends Context.Tag("ShopifySessionStorage")<
  ShopifySessionStorage,
  {
    storeSession: (session: Session) => Effect.Effect<void, Error>;

    loadSession: (sessionId: string) => Effect.Effect<Session | null, Error>;
  }
>() {}
