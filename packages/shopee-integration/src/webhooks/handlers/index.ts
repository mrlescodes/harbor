import { Effect } from "effect";

import type { ShopeeWebhook } from "../schema";
import { isOrderStatusPush, validateShopeeWebhook } from "../schema";
import { processOrderStatusPush } from "./order-status-push-handler";

const processWebhook = (payload: ShopeeWebhook) => {
  return Effect.gen(function* () {
    if (isOrderStatusPush(payload)) {
      return yield* processOrderStatusPush(payload);
    }

    return yield* Effect.fail(
      new Error(`Unsupported push notification code: ${payload.code}`),
    );
  });
};

export const shopeeWebhookHandler = (rawData: unknown) => {
  return Effect.gen(function* () {
    const payload = yield* validateShopeeWebhook(rawData);

    return yield* processWebhook(payload);
  });
};
