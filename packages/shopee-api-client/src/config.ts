import { Effect, Context, Layer } from "effect";

export type ShopeeAPIConfigParams = {
  readonly apiBaseUrl: string;
  readonly partnerId: number;
  readonly partnerKey: string;
  readonly accessToken: string;
  readonly shopId: number;
};

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
