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
