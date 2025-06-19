import { Effect } from "effect";

import type { ShopeeWebhook } from "../schema";
import { isOrderStatusPush, validateShopeeWebhook } from "../schema";
import { processOrderStatusPush } from "./order-status-push-handler";

const processWebhook = (data: ShopeeWebhook) => {
  return Effect.gen(function* () {
    if (isOrderStatusPush(data)) {
      return yield* processOrderStatusPush(data);
    }

    return yield* Effect.fail(
      new Error(`Unsupported push notification code: ${data.code}`),
    );
  });
};

export const shopeeWebhookHandler = (rawData: unknown) => {
  return Effect.gen(function* () {
    const data = yield* validateShopeeWebhook(rawData);

    return yield* processWebhook(data);
  });
};
