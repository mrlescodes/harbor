import { Effect } from "effect";

import { OrderStatus, ShopeeAPIClient } from "@harbor/shopee-api-client/api";
import { ShopifyAPIClient } from "@harbor/shopify-api-client/api";

import type { OrderStatusPush } from "../schema";
import { ShopeeIntegration } from "../../integration";
import { buildShopifyOrder } from "../transformers/build-shopify-order";

const handleReadyToShip = (payload: OrderStatusPush) => {
  return Effect.gen(function* () {
    const shopeeIntegration = yield* ShopeeIntegration;
    const shopeeAPIClient = yield* ShopeeAPIClient;
    const shopifyAPIClient = yield* ShopifyAPIClient;

    const connection = yield* shopeeIntegration.getShopifyShopByShopeeId(
      payload.shop_id,
    );

    if (!connection) {
      return yield* Effect.fail(new Error(`No connection found`));
    }

    const orderDetailResponse = yield* shopeeAPIClient.getOrderDetail(
      payload.shop_id,
      {
        orderNumbers: [payload.data.ordersn],
      },
    );

    const orderDetail = orderDetailResponse.response.order_list[0];

    // Typescript array guard
    if (!orderDetail) {
      return yield* Effect.fail(new Error("Order not found"));
    }

    const escrowDetailResponse = yield* shopeeAPIClient.getEscrowDetail(
      payload.shop_id,
      {
        orderNumber: payload.data.ordersn,
      },
    );

    const orderIncome = escrowDetailResponse.response.order_income;

    /**
     * Prepare Line items
     */

    // Transform response
    const items = orderDetail.item_list.map((item) => {
      return {
        marketplaceProductId: item.item_id,
        ...(item.model_id !== 0 && {
          marketplaceVariantId: item.model_id,
        }),
      };
    });

    const marketplaceProductMappingsResponse =
      yield* shopeeIntegration.getMappingsByMarketplaceIds(items);

    // Build a Map for quick lookup using item_id + model_id combo as key
    const mappingMap = new Map<string, string>( // string to shopifyVariantId
      marketplaceProductMappingsResponse.map((m) => {
        const key = `${m.marketplaceProductId}:${m.marketplaceVariantId ?? "null"}`;
        return [key, m.shopifyVariantId]; // shopifyVariantId is what Shopify expects
      }),
    );

    // Build line items
    const lineItems = orderDetail.item_list.map((item) => {
      const mappingKey = `${item.item_id}:${item.model_id || "null"}`;
      const mappedShopifyId = mappingMap.get(mappingKey);

      if (mappedShopifyId) {
        return {
          variantId: mappedShopifyId,
          quantity: item.model_quantity_purchased,
          priceSet: {
            shopMoney: {
              amount: item.model_original_price,
              currencyCode: orderDetail.currency,
            },
          },
        };
      }

      return {
        title: item.item_name,
        priceSet: {
          shopMoney: {
            amount: item.model_original_price,
            currencyCode: orderDetail.currency,
          },
        },
        quantity: item.model_quantity_purchased,
        requiresShipping: true,
      };
    });

    /**
     * Prepare Order
     */

    const shopifyOrder = buildShopifyOrder(orderDetail, orderIncome, lineItems);

    yield* shopifyAPIClient.createOrder(connection.shopifyShop, shopifyOrder);

    return {
      handler: `Handled Webhook: ${OrderStatus.READY_TO_SHIP}`,
    };
  });
};

const handleCancelled = (payload: OrderStatusPush) => {
  return Effect.gen(function* () {
    const shopeeIntegration = yield* ShopeeIntegration;
    const shopifyAPIClient = yield* ShopifyAPIClient;

    const connection = yield* shopeeIntegration.getShopifyShopByShopeeId(
      payload.shop_id,
    );

    if (!connection) {
      return yield* Effect.fail(new Error(`No connection found`));
    }

    // TODO: Magic string to const
    const order = yield* shopifyAPIClient.findOrderByCustomId(
      connection.shopifyShop,
      {
        namespace: "harbor",
        key: "shopee_order_id",
        value: payload.data.ordersn,
      },
    );

    // TODO: Add type generation and remove this
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const orderId = order.data?.orderByIdentifier?.id;
    if (!orderId || typeof orderId !== "string") {
      return yield* Effect.fail(new Error("No order found"));
    }

    yield* shopifyAPIClient.deleteOrder(connection.shopifyShop, orderId);

    return {
      handler: `Handled Webhook: ${OrderStatus.CANCELLED}`,
    };
  });
};

const handleShipped = (payload: OrderStatusPush) => {
  return Effect.gen(function* () {
    const shopeeIntegration = yield* ShopeeIntegration;
    const shopifyAPIClient = yield* ShopifyAPIClient;

    const connection = yield* shopeeIntegration.getShopifyShopByShopeeId(
      payload.shop_id,
    );

    if (!connection) {
      return yield* Effect.fail(new Error(`No connection found`));
    }

    // TODO: Magic string to const
    const order = yield* shopifyAPIClient.findOrderByCustomId(
      connection.shopifyShop,
      {
        namespace: "harbor",
        key: "shopee_order_id",
        value: payload.data.ordersn,
      },
    );

    // TODO: Add type generation and remove this
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const fulfillmentOrderId =
      order.data?.orderByIdentifier?.fulfillmentOrders?.edges[0].node.id;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    if (!fulfillmentOrderId || typeof fulfillmentOrderId !== "string") {
      return yield* Effect.fail(new Error("No fullfilment order found"));
    }

    yield* shopifyAPIClient.fulfillOrder(
      connection.shopifyShop,
      fulfillmentOrderId,
    );

    return {
      handler: `Handled Webhook: ${OrderStatus.SHIPPED}`,
    };
  });
};

export const processOrderStatusPush = (payload: OrderStatusPush) => {
  return Effect.gen(function* () {
    if (payload.data.status === OrderStatus.READY_TO_SHIP) {
      return yield* handleReadyToShip(payload);
    }

    if (payload.data.status === OrderStatus.CANCELLED) {
      return yield* handleCancelled(payload);
    }

    if (payload.data.status === OrderStatus.SHIPPED) {
      return yield* handleShipped(payload);
    }

    return yield* Effect.fail(new Error("Unsupported status"));
  });
};
