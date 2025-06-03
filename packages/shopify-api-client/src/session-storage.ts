import type { Effect } from "effect";
import { Context } from "effect";

export class ShopifySessionStorage extends Context.Tag("ShopifySessionStorage")<
  ShopifySessionStorage,
  {
    storeSession: ({
      sessionId,
      shop,
    }: {
      sessionId: string;
      shop: string;
    }) => Effect.Effect<void, Error>;
  }
>() {}
