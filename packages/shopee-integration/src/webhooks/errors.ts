import { Data } from "effect";

export class ShopeeWebhookError extends Data.TaggedError("ShopeeWebhookError")<{
  message: string;
}> {}
