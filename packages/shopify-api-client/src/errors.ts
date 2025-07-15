import { Data } from "effect";

import { messageFromUnknown } from "@harbor/shared";

export class ShopifyTokenExchangeError extends Data.TaggedError(
  "ShopifyTokenExchangeError",
)<{
  shop: string;
  cause?: unknown;
}> {
  get message() {
    return `Token exchange failed for Shopify shop: ${this.shop}`;
  }
}

export class ShopifySessionNotFoundError extends Data.TaggedError(
  "ShopifySessionNotFoundError",
)<{
  shop: string;
  cause?: unknown;
}> {
  get message() {
    return `Session not found for Shopify shop: ${this.shop}`;
  }
}

export class ShopifySessionExpiredError extends Data.TaggedError(
  "ShopifySessionExpiredError",
)<{
  shop: string;
  cause?: unknown;
}> {
  get message() {
    return `Session expired for Shopify shop: ${this.shop}`;
  }
}

export class ShopifyAccessTokenMissingError extends Data.TaggedError(
  "ShopifyAccessTokenMissingError",
)<{
  shop: string;
  cause?: unknown;
}> {
  get message() {
    return `Access token missing for Shopify shop: ${this.shop}`;
  }
}

export class ShopifyResponseError extends Data.TaggedError(
  "ShopifyResponseError",
)<{
  message: string;
  cause?: unknown;
}> {}

export const mapShopifyError = (error: unknown) => {
  return new ShopifyResponseError({
    message: messageFromUnknown(error),
    cause: error,
  });
};
