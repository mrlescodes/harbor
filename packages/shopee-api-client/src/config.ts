import { Context, Effect, Layer } from "effect";

// TODO: Convert to Effect config / service?

export interface ShopeeAPIConfigParams {
  apiBaseUrl: string;
  partnerId: number;
  partnerKey: string;
}

export class ShopeeAPIConfig extends Context.Tag("ShopeeAPIConfig")<
  ShopeeAPIConfig,
  {
    readonly getConfig: Effect.Effect<ShopeeAPIConfigParams>;
  }
>() {}

export const createShopeeAPIConfigLayer = (config: ShopeeAPIConfigParams) => {
  return Layer.succeed(
    ShopeeAPIConfig,
    ShopeeAPIConfig.of({
      getConfig: Effect.succeed(config),
    }),
  );
};
