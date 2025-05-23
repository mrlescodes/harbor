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
  GetProductDetailResponse,
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
      params?: {
        timeRangeField?: "create_time" | "update_time";
        timeFrom?: number;
        timeTo?: number;
        pageSize?: number;
        cursor?: string;
        orderStatusList?: string[];
      },
    ) => {
      const apiPath = "/api/v2/order/get_order_list";

      const now = Math.floor(Date.now() / 1000);
      const oneDayAgo = now - 86400;

      const {
        timeRangeField = "create_time",
        timeFrom = oneDayAgo,
        timeTo = now,
        pageSize = 20,
        cursor,
        orderStatusList,
      } = params ?? {};

      const additionalParams: Record<string, string> = {
        time_range_field: timeRangeField,
        time_from: timeFrom.toString(),
        time_to: timeTo.toString(),
        page_size: pageSize.toString(),
      };

      if (cursor) {
        additionalParams.cursor = cursor;
      }

      if (orderStatusList?.length) {
        additionalParams.order_status = orderStatusList.join(",");
      }

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
    },

    getProductList: (
      shopId: number,
      params?: {
        offset?: number;
        pageSize?: number;
        itemStatus?: string;
      },
    ) => {
      const apiPath = "/api/v2/product/get_item_list";

      const {
        offset = "0",
        pageSize = "10",
        itemStatus = "NORMAL",
      } = params ?? {};

      const additionalParams: Record<string, string> = {
        offset: offset.toString(),
        page_size: pageSize.toString(),
        item_status: itemStatus,
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

    getProductDetail: (shopId: number, params: { itemIds: number[] }) => {
      const apiPath = "/api/v2/product/get_item_base_info";

      const additionalParams: Record<string, string> = {
        item_id_list: params.itemIds.join(","),
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

        return yield* HttpClientResponse.schemaBodyJson(
          GetProductDetailResponse,
        )(response);
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
