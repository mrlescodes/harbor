import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Context, Effect, Layer } from "effect";

import { ShopeeAPIConfig } from "../config";
import { ShopeeTokenStorage } from "../token-storage";
import {
  generateSignature,
  getCurrentTimestamp,
  isTokenExpired,
} from "../utils";
import { GetAccessTokenResponse, RefreshAccessTokenResponse } from "./schema";

/**
 * @see https://open.shopee.com/developer-guide/20
 */
const make = Effect.gen(function* () {
  const defaultClient = yield* HttpClient.HttpClient;
  const config = yield* ShopeeAPIConfig;
  const tokenStorage = yield* ShopeeTokenStorage;

  const { apiBaseUrl, partnerId, partnerKey } = yield* config.getConfig;

  const baseClient = defaultClient.pipe(
    HttpClient.mapRequest(HttpClientRequest.prependUrl(apiBaseUrl)),
  );

  const prepareSearchParams = (apiPath: string) => {
    const timestamp = getCurrentTimestamp();
    const baseString = `${partnerId}${apiPath}${timestamp}`;
    const signature = generateSignature(partnerKey, baseString);

    const searchParams = new URLSearchParams();
    searchParams.append("partner_id", partnerId.toString());
    searchParams.append("timestamp", timestamp.toString());
    searchParams.append("sign", signature);

    return searchParams;
  };

  const prepareRequest = (apiPath: string) => {
    const searchParams = prepareSearchParams(apiPath);
    return baseClient.pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(HttpClientRequest.appendUrlParams(searchParams)),
      ),
    );
  };

  // Internal refresh logic
  const performTokenRefresh = (refreshToken: string, shopId: number) => {
    const apiPath = "/api/v2/auth/access_token/get";

    return Effect.gen(function* () {
      const client = prepareRequest(apiPath);

      const req = yield* HttpClientRequest.post(apiPath).pipe(
        HttpClientRequest.setHeaders({
          "Content-Type": "application/json",
        }),
        HttpClientRequest.bodyJson({
          shop_id: shopId,
          partner_id: partnerId,
          refresh_token: refreshToken,
        }),
      );

      const response = yield* client.execute(req);

      const tokenResponse = yield* HttpClientResponse.schemaBodyJson(
        RefreshAccessTokenResponse,
      )(response);

      yield* tokenStorage.storeToken(shopId, {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expire_in,
      });

      return tokenResponse;
    }).pipe(Effect.scoped);
  };

  /**
   * @see https://open.shopee.com/developer-guide/20
   */
  const getAuthUrl = (redirectUrl: string) => {
    const apiPath = "/api/v2/shop/auth_partner";
    const searchParams = prepareSearchParams(apiPath);
    searchParams.append("redirect", redirectUrl);

    const url = new URL(`${apiBaseUrl}${apiPath}`);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  };

  /**
   * @see https://open.shopee.com/documents/v2/v2.public.get_access_token?module=104&type=1
   */
  const getAccessToken = (code: string, shopId: number) => {
    const apiPath = "/api/v2/auth/token/get";

    return Effect.gen(function* () {
      const client = prepareRequest(apiPath);

      const req = yield* HttpClientRequest.post(apiPath).pipe(
        HttpClientRequest.setHeaders({
          "Content-Type": "application/json",
        }),
        HttpClientRequest.bodyJson({
          shop_id: shopId,
          partner_id: partnerId,
          code,
        }),
      );

      const response = yield* client.execute(req);

      const tokenResponse = yield* HttpClientResponse.schemaBodyJson(
        GetAccessTokenResponse,
      )(response);

      yield* tokenStorage.storeToken(shopId, {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expire_in,
      });

      return tokenResponse;
    }).pipe(Effect.scoped);
  };

  /**
   * @see https://open.shopee.com/documents/v2/v2.public.refresh_access_token?module=104&type=1
   */
  const refreshAccessToken = (refreshToken: string, shopId: number) => {
    return performTokenRefresh(refreshToken, shopId);
  };

  /**
   * Get a valid access token for the shop, automatically refreshing if needed
   * This is the main method API clients should use
   */
  const getValidAccessToken = (shopId: number) => {
    return Effect.gen(function* () {
      const token = yield* tokenStorage.getToken(shopId);

      if (token.expiresAt && !isTokenExpired(token.expiresAt)) {
        return token.accessToken;
      }

      const refreshedTokenResponse = yield* performTokenRefresh(
        token.refreshToken,
        shopId,
      );

      return refreshedTokenResponse.access_token;
    });
  };

  return {
    getAuthUrl,
    getAccessToken,
    refreshAccessToken,
    getValidAccessToken,
  };
});

export class ShopeeAuthClient extends Context.Tag("ShopeeAuthClient")<
  ShopeeAuthClient,
  Effect.Effect.Success<typeof make>
>() {
  static readonly Live = Layer.effect(ShopeeAuthClient, make).pipe(
    Layer.provide(FetchHttpClient.layer),
  );
}
