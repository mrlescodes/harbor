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

export class ShopifyUserError extends Data.TaggedError("ShopifyUserError")<{
  errors: {
    message: string;
    field?: string[] | null;
  }[];
}> {
  get message() {
    if (this.errors.length > 0) {
      return this.errors.map((e) => e.message).join(" ");
    }

    return "An unknown user error occurred";
  }
}

export const mapShopifyError = (error: unknown) => {
  return new ShopifyResponseError({
    message: messageFromUnknown(error),
    cause: error,
  });
};
