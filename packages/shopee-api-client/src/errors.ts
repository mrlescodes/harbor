import { Data } from "effect";

export class ShopeeCredentialsNotFoundError extends Data.TaggedError(
  "ShopeeCredentialsNotFoundError",
)<{
  shopId: number;
  cause?: unknown;
}> {
  get message() {
    return `Shopee API credentials not found for Shopee shop: ${this.shopId}`;
  }
}

export class ShopeeResponseError extends Data.TaggedError(
  "ShopeeResponseError",
)<{
  shopId: number;
  apiPath: string;
  requestId: string;
  error: string;
  message: string;
}> {}
