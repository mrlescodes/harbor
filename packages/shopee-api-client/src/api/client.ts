import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Context, Effect, Layer } from "effect";

import { ShopeeAuthClient } from "../auth";
import { ShopeeAPIConfig } from "../config";
import { generateSignature, getCurrentTimestamp } from "../utils";
import {
  GetOrderDetailResponse,
  GetOrderListResponse,
  GetProductListResponse,
} from "./schema";

const makeShopeeAPIClient = Effect.gen(function* () {
  const config = yield* ShopeeAPIConfig;
  const authClient = yield* ShopeeAuthClient;
  const defaultClient = yield* HttpClient.HttpClient;

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

  return {
    /**
     * @see https://open.shopee.com/documents/v2/v2.order.get_order_detail?module=94&type=1
     */
    getOrderDetail: (shopId: number, params: { orderNumbers: string[] }) => {
      const apiPath = "/api/v2/order/get_order_detail";

      const additionalParams = {
        order_sn_list: params.orderNumbers.join(","),
      };

      return Effect.gen(function* () {
        // Auth client handles token validation and refresh
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
    },

    /**
     * Get list of orders for a shop
     */
    getOrderList: (
      shopId: number,
      params: {
        timeRangeField: "create_time" | "update_time";
        timeFrom: number;
        timeTo: number;
        pageSize?: number;
        cursor?: string;
        orderStatusList?: string[];
      },
    ) => {
      const apiPath = "/api/v2/order/get_order_list";

      const additionalParams: Record<string, string> = {
        time_range_field: params.timeRangeField,
        time_from: params.timeFrom.toString(),
        time_to: params.timeTo.toString(),
        page_size: (params.pageSize ?? 20).toString(),
      };

      if (params.cursor) {
        additionalParams.cursor = params.cursor;
      }

      if (params.orderStatusList?.length) {
        additionalParams.order_status = params.orderStatusList.join(",");
      }

      return Effect.gen(function* () {
        // Auth client handles token validation and refresh
        const accessToken = yield* authClient.getValidAccessToken(shopId);

        const client = prepareRequest(
          apiPath,
          shopId,
          accessToken,
          additionalParams,
        );
        const req = HttpClientRequest.get(apiPath);
        const response = yield* client.execute(req);

        // You'll need to define GetOrderListResponse schema
        return yield* HttpClientResponse.schemaBodyJson(GetOrderListResponse)(
          response,
        );
      }).pipe(Effect.scoped);
    },

    getProductList: (
      shopId: number,
      params: {
        offset?: number;
        pageSize?: number;
        itemStatus?: string;
      } = {},
    ) => {
      const apiPath = "/api/v2/product/get_item_list";

      const additionalParams: Record<string, string> = {
        offset: params.offset?.toString() ?? "0",
        page_size: params.pageSize?.toString() ?? "10",
        item_status: params.itemStatus ?? "NORMAL",
      };

      return Effect.gen(function* () {
        // Auth client handles token validation and refresh
        const accessToken = yield* authClient.getValidAccessToken(shopId);

        const client = prepareRequest(
          apiPath,
          shopId,
          accessToken,
          additionalParams,
        );

        const req = HttpClientRequest.get(apiPath);
        const response = yield* client.execute(req);

        return yield* HttpClientResponse.schemaBodyJson(GetProductListResponse)(
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
