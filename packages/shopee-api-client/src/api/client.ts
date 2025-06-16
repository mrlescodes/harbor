import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { getUnixTime, subDays } from "date-fns";
import { Context, Effect, Layer } from "effect";

import { ShopeeAuthClient } from "../auth";
import { ShopeeAPIConfig } from "../config";
import { generateSignature, getCurrentTimestamp } from "../utils";
import { GetOrderDetailResponse, GetOrderListResponse } from "./schema";

const make = Effect.gen(function* () {
  const defaultClient = yield* HttpClient.HttpClient;
  const config = yield* ShopeeAPIConfig;
  const authClient = yield* ShopeeAuthClient;

  const { apiBaseUrl, partnerId, partnerKey } = yield* config.getConfig;

  const baseClient = defaultClient.pipe(
    HttpClient.mapRequest(HttpClientRequest.prependUrl(apiBaseUrl)),
  );

  const prepareSearchParams = (
    apiPath: string,
    shopId: number,
    accessToken: string,
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
    shopId: number,
    accessToken: string,
    additionalParams: Record<string, string> = {},
  ) => {
    const searchParams = prepareSearchParams(
      apiPath,
      shopId,
      accessToken,
      additionalParams,
    );

    return baseClient.pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(HttpClientRequest.appendUrlParams(searchParams)),
      ),
    );
  };

  /**
   * Get list of orders for a shop
   *
   * @see https://open.shopee.com/documents/v2/v2.order.get_order_list?module=94&type=1
   */
  const getOrderList = (
    shopId: number,
    params?: {
      timeRangeField?: "create_time" | "update_time";
      timeFrom?: number;
      timeTo?: number;
      pageSize?: number;
    },
  ) => {
    const apiPath = "/api/v2/order/get_order_list";

    const now = getCurrentTimestamp();
    const fifteenDaysAgo = getUnixTime(subDays(new Date(), 15));

    const {
      timeRangeField = "create_time",
      timeFrom = fifteenDaysAgo,
      timeTo = now,
      pageSize = 100,
    } = params ?? {};

    const additionalParams: Record<string, string> = {
      time_range_field: timeRangeField,
      time_from: timeFrom.toString(),
      time_to: timeTo.toString(),
      page_size: pageSize.toString(),
      response_optional_fields: "order_status",
    };

    return Effect.gen(function* () {
      const accessToken = yield* authClient.getValidAccessToken(shopId);

      const client = prepareRequest(
        apiPath,
        shopId,
        accessToken,
        additionalParams,
      );
      const req = HttpClientRequest.get(apiPath);
      const response = yield* client.execute(req);

      return yield* HttpClientResponse.schemaBodyJson(GetOrderListResponse)(
        response,
      );
    }).pipe(Effect.scoped);
  };

  /**
   * @see https://open.shopee.com/documents/v2/v2.order.get_order_detail?module=94&type=1
   */
  const getOrderDetail = (
    shopId: number,
    params: { orderNumbers: string[] },
  ) => {
    const apiPath = "/api/v2/order/get_order_detail";

    const additionalParams = {
      order_sn_list: params.orderNumbers.join(","),
    };

    return Effect.gen(function* () {
      const accessToken = yield* authClient.getValidAccessToken(shopId);

      const client = prepareRequest(
        apiPath,
        shopId,
        accessToken,
        additionalParams,
      );
      const req = HttpClientRequest.get(apiPath);
      const response = yield* client.execute(req);

      return yield* HttpClientResponse.schemaBodyJson(GetOrderDetailResponse)(
        response,
      );
    }).pipe(Effect.scoped);
  };

  return {
    getOrderList,
    getOrderDetail,
  };
});

export class ShopeeAPIClient extends Context.Tag("ShopeeAPIClient")<
  ShopeeAPIClient,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopeeAPIClient, make).pipe(
    Layer.provide(FetchHttpClient.layer),
  );
}
