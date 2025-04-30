import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Context, Effect, Layer } from "effect";

import { ShopeeAPIConfig } from "../config";
import { generateSignature, getCurrentTimestamp } from "../utils";
import { GetOrderDetailResponse } from "./schema";

const makeShopeeAPIClient = Effect.gen(function* () {
  const config = yield* ShopeeAPIConfig;
  const defaultClient = yield* HttpClient.HttpClient;

  const { apiBaseUrl, partnerId, partnerKey, accessToken, shopId } =
    yield* config.getConfig;

  const baseClient = defaultClient.pipe(
    HttpClient.mapRequest(HttpClientRequest.prependUrl(apiBaseUrl)),
  );

  const prepareSearchParams = (
    apiPath: string,
    additionalParams: Record<string, string> = {},
  ) => {
    const timestamp = getCurrentTimestamp();

    const baseString = `${partnerId}${apiPath}${timestamp}${accessToken}${shopId}`;
    const signature = generateSignature(partnerKey, baseString);

    const searchParams = new URLSearchParams();
    searchParams.append("partner_id", partnerId.toString());
    searchParams.append("timestamp", timestamp.toString());
    searchParams.append("access_token", accessToken);
    searchParams.append("shop_id", shopId.toString());
    searchParams.append("sign", signature);

    Object.entries(additionalParams).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    return searchParams;
  };

  const prepareRequest = (
    apiPath: string,
    additionalParams: Record<string, string> = {},
  ) => {
    const searchParams = prepareSearchParams(apiPath, additionalParams);

    return baseClient.pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(HttpClientRequest.appendUrlParams(searchParams)),
      ),
    );
  };

  return {
    /**
     * @see https://open.shopee.com/documents/v2/v2.order.get_order_detail?module=94&type=1
     */
    getOrderDetail: (params: { orderNumbers: string[] }) => {
      const apiPath = "/api/v2/order/get_order_detail";

      const additionalParams = {
        order_sn_list: params.orderNumbers.join(","),
      };

      return Effect.gen(function* () {
        const client = prepareRequest(apiPath, additionalParams);

        const req = HttpClientRequest.get(apiPath);

        const response = yield* client.execute(req);

        return yield* HttpClientResponse.schemaBodyJson(GetOrderDetailResponse)(
          response,
        );
      }).pipe(Effect.scoped);
    },
  };
});

export class ShopeeAPIClient extends Context.Tag("ShopeeAPIClient")<
  ShopeeAPIClient,
  Effect.Effect.Success<typeof makeShopeeAPIClient>
>() {
  static readonly Live = Layer.effect(
    ShopeeAPIClient,
    makeShopeeAPIClient,
  ).pipe(Layer.provide(FetchHttpClient.layer));
}
