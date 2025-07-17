import { Schema } from "effect";

import { ErrorResponse } from "../schema";

/**
 * Get Access Token Response
 */

export const GetAccessTokenSuccessResponse = Schema.Struct({
  refresh_token: Schema.String,
  access_token: Schema.String,
  expire_in: Schema.Int,
});

export const GetAccessTokenResponse = Schema.Union(
  ErrorResponse,
  GetAccessTokenSuccessResponse,
);

export type GetAccessTokenResponse = Schema.Schema.Type<
  typeof GetAccessTokenResponse
>;

/**
 * Refresh Access Token Response
 */

export const RefreshAccessTokenSuccessResponse = Schema.Struct({
  partner_id: Schema.Int,
  refresh_token: Schema.String,
  access_token: Schema.String,
  expire_in: Schema.Int,
  shop_id: Schema.Int,
});

export const RefreshAccessTokenResponse = Schema.Union(
  ErrorResponse,
  RefreshAccessTokenSuccessResponse,
);

export type RefreshAccessTokenResponse = Schema.Schema.Type<
  typeof RefreshAccessTokenResponse
>;
