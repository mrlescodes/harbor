import { Effect } from "effect";

import { OrderStatus, ShopeeAPIClient } from "@harbor/shopee-api-client/api";
import { ShopifyAPIClient } from "@harbor/shopify-api-client/api";

import type { OrderStatusPush } from "../schema";
import { ShopeeIntegration } from "../../integration";
import { transformOrder } from "../transformers/order";

const handleReadyToShip = (payload: OrderStatusPush) => {
  return Effect.gen(function* () {
    const shopeeApiClient = yield* ShopeeAPIClient;
    const shopeeIntegration = yield* ShopeeIntegration;
    const shopifyAPIClient = yield* ShopifyAPIClient;

    const connection = yield* shopeeIntegration.getShopifyShopByShopeeId(
      payload.shop_id,
    );

    // Bail early connection exists to avoid un-necessary API calls for webhook we cannot process
    if (!connection) {
      return yield* Effect.fail(new Error(`No connection found`));
    }

    const shopeeOrder = yield* shopeeApiClient.getOrderDetail(payload.shop_id, {
      orderNumbers: [payload.data.ordersn],
    });

    const shopifyOrder = transformOrder(shopeeOrder);

    yield* shopifyAPIClient.createOrder(connection.shopifyShop, {
      order: shopifyOrder,
    });

    return {
      handler: `Handled Webhook: ${OrderStatus.READY_TO_SHIP}`,
    };
  });
};

export const processOrderStatusPush = (payload: OrderStatusPush) => {
  return Effect.gen(function* () {
    if (payload.data.status === OrderStatus.READY_TO_SHIP) {
      return yield* handleReadyToShip(payload);
    }

    return yield* Effect.fail(new Error("Unsupported status"));
  });
};
