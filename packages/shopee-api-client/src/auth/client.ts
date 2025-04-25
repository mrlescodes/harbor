import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Context, Effect, Layer } from "effect";

import { ShopeeAPIConfig } from "../config";
import { generateSignature, getCurrentTimestamp } from "../utils";
import { GetAccessTokenResponse, RefreshAccessTokenResponse } from "./schema";

const makeShopeeAuthClient = Effect.gen(function* () {
  const config = yield* ShopeeAPIConfig;
  const defaultClient = yield* HttpClient.HttpClient;

  const { apiBaseUrl, partnerId, partnerKey } = yield* config.getConfig;

  const baseClient = defaultClient.pipe(
    HttpClient.mapRequest(HttpClientRequest.prependUrl(apiBaseUrl))
  );

  const prepareAuthSearchParams = (apiPath: string) => {
    const timestamp = getCurrentTimestamp();

    const baseString = `${partnerId}${apiPath}${timestamp}`;
    const signature = generateSignature(partnerKey, baseString);

    const searchParams = new URLSearchParams();
    searchParams.append("partner_id", partnerId.toString());
    searchParams.append("timestamp", timestamp.toString());
    searchParams.append("sign", signature);

    return searchParams;
  };

  const prepareAuthRequest = (apiPath: string) => {
    const searchParams = prepareAuthSearchParams(apiPath);

    return baseClient.pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(HttpClientRequest.appendUrlParams(searchParams))
      )
    );
  };

  return {
    /**
     * @see https://open.shopee.com/developer-guide/20
     */
    getAuthUrl: (redirectUrl: string) => {
      const apiPath = "/api/v2/shop/auth_partner";
      const searchParams = prepareAuthSearchParams(apiPath);

      // Add the redirect parameter
      searchParams.append("redirect", redirectUrl);

      const url = new URL(`${apiBaseUrl}${apiPath}`);

      searchParams.forEach((value, key) => {
        url.searchParams.append(key, value);
      });

      return url.toString();
    },

    /**
     * @see https://open.shopee.com/documents/v2/v2.public.get_access_token?module=104&type=1
     */
    getAccessToken: (code: string, shopId: number) => {
      const apiPath = "/api/v2/auth/token/get";

      return Effect.gen(function* () {
        const client = prepareAuthRequest(apiPath);

        const req = yield* HttpClientRequest.post(apiPath).pipe(
          HttpClientRequest.setHeaders({ "Content-Type": "application/json" }),
          HttpClientRequest.bodyJson({
            shop_id: shopId,
            partner_id: partnerId,
            code,
          })
        );

        const response = yield* client.execute(req);

        // TODO: Handle invalid code response explicitly
        return yield* HttpClientResponse.schemaBodyJson(GetAccessTokenResponse)(
          response
        );
      }).pipe(Effect.scoped);
    },

    /**
     * @see https://open.shopee.com/documents/v2/v2.public.refresh_access_token?module=104&type=1
     */
    refreshAccessToken: (refreshToken: string, shopId: number) => {
      const apiPath = "/api/v2/auth/access_token/get";

      return Effect.gen(function* () {
        const client = prepareAuthRequest(apiPath);

        const req = yield* HttpClientRequest.post(apiPath).pipe(
          HttpClientRequest.setHeaders({ "Content-Type": "application/json" }),
          HttpClientRequest.bodyJson({
            shop_id: shopId,
            partner_id: partnerId,
            refresh_token: refreshToken,
          })
        );

        const response = yield* client.execute(req);

        // TODO: Handle invalid refresh token response explicitly
        return yield* HttpClientResponse.schemaBodyJson(
          RefreshAccessTokenResponse
        )(response);
      }).pipe(Effect.scoped);
    },
  };
});

export class ShopeeAuthClient extends Context.Tag("ShopeeAuthClient")<
  ShopeeAuthClient,
  Effect.Effect.Success<typeof makeShopeeAuthClient>
>() {
  static readonly Live = Layer.effect(
    ShopeeAuthClient,
    makeShopeeAuthClient
  ).pipe(Layer.provide(FetchHttpClient.layer));
}
