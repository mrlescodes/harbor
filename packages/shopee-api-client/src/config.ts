import { Context, Effect, Layer } from "effect";

export interface ShopeeAPIConfigParams {
  readonly apiBaseUrl: string;
  readonly partnerId: number;
  readonly partnerKey: string;
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
