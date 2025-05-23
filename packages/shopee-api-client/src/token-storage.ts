import type { Effect } from "effect";
import { Context } from "effect";

// TODO: Check required shape
export class ShopeeTokenStorage extends Context.Tag("ShopeeTokenStorage")<
  ShopeeTokenStorage,
  {
    /**
     * Store tokens for a specific Shopee shop ID
     */
    storeToken: (
      shopId: number,
      tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn?: number;
      },
    ) => Effect.Effect<void, Error>;

    /**
     * Get tokens for a specific Shopee shop ID
     */
    getToken: (shopId: number) => Effect.Effect<
      {
        accessToken: string;
        refreshToken: string;
        expiresAt: Date;
      },
      Error
    >;

    /**
     * Clear tokens for a specific Shopee shop ID
     */
    clearToken: (shopId: number) => Effect.Effect<void, Error>;
  }
>() {}
