import { Schema } from "effect";

export const GetAccessTokenResponse = Schema.Struct({
  refresh_token: Schema.String,
  access_token: Schema.String,
  expire_in: Schema.Int,
  request_id: Schema.String,
  error: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
});

export type GetAccessTokenResponse = Schema.Schema.Type<
  typeof GetAccessTokenResponse
>;

export const RefreshAccessTokenResponse = Schema.Struct({
  partner_id: Schema.Int,
  refresh_token: Schema.String,
  access_token: Schema.String,
  expire_in: Schema.Int,
  request_id: Schema.String,
  error: Schema.optional(Schema.String),
  message: Schema.optional(Schema.String),
  shop_id: Schema.Int,
});

export type RefreshAccessTokenResponse = Schema.Schema.Type<
  typeof RefreshAccessTokenResponse
>;
