import { Effect } from "effect";

import { OrderStatus, ShopeeAPIClient } from "@harbor/shopee-api-client/api";
import { ShopifyAPIClient } from "@harbor/shopify-api-client/api";

import type { OrderStatusPush } from "../schema";
import { ShopeeIntegration } from "../../integration";
import { ShopeeWebhookError } from "../errors";
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
      return yield* new ShopeeWebhookError({
        message: `No connection found for Shopee shop: ${payload.shop_id}`,
      });
    }

    const existingOrder = yield* shopifyAPIClient.findOrderByIdentifier(
      connection.shopifyShop,
      {
        customId: {
          namespace: "harbor",
          key: "shopee_order_id",
          value: payload.data.ordersn,
        },
      },
    );

    if (existingOrder) {
      return yield* new ShopeeWebhookError({
        message: `Order already exists: ${payload.data.ordersn}`,
      });
    }

    const orderDetailResponse = yield* shopeeAPIClient.getOrderDetail(
      payload.shop_id,
      {
        orderNumbers: [payload.data.ordersn],
      },
    );

    const orderDetail = orderDetailResponse.order_list[0];
    if (!orderDetail) {
      return yield* new ShopeeWebhookError({
        message: `No order found for Shopee order: ${payload.data.ordersn}`,
      });
    }

    const escrowDetailResponse = yield* shopeeAPIClient.getEscrowDetail(
      payload.shop_id,
      {
        orderNumber: payload.data.ordersn,
      },
    );

    const orderIncome = escrowDetailResponse.order_income;

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
    const mappingMap = new Map<string, string>(
      marketplaceProductMappingsResponse.map((m) => {
        const key = `${m.marketplaceProductId}:${m.marketplaceVariantId ?? "null"}`;
        return [key, m.shopifyVariantId];
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
      success: true,
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
      return yield* new ShopeeWebhookError({
        message: `No connection found for Shopee shop: ${payload.shop_id}`,
      });
    }

    // TODO: Magic string to const
    const order = yield* shopifyAPIClient.findOrderByIdentifier(
      connection.shopifyShop,
      {
        customId: {
          namespace: "harbor",
          key: "shopee_order_id",
          value: payload.data.ordersn,
        },
      },
    );

    if (!order) {
      return yield* new ShopeeWebhookError({
        message: `No order found for Shopee order: ${payload.data.ordersn}`,
      });
    }

    yield* shopifyAPIClient.deleteOrder(connection.shopifyShop, order.id);

    return {
      success: true,
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
      return yield* new ShopeeWebhookError({
        message: `No connection found for Shopee shop: ${payload.shop_id}`,
      });
    }

    // TODO: Magic string to const
    const order = yield* shopifyAPIClient.findOrderByIdentifier(
      connection.shopifyShop,
      {
        customId: {
          namespace: "harbor",
          key: "shopee_order_id",
          value: payload.data.ordersn,
        },
      },
    );

    const fulfillmentOrderId = order?.fulfillmentOrders[0]?.id;
    if (!fulfillmentOrderId) {
      return yield* new ShopeeWebhookError({
        message: `No fulfillment order found for Shopee order: ${payload.data.ordersn}`,
      });
    }

    yield* shopifyAPIClient.createFulfillment(connection.shopifyShop, {
      lineItemsByFulfillmentOrder: [
        {
          fulfillmentOrderId,
          fulfillmentOrderLineItems: [],
        },
      ],
      notifyCustomer: false,
    });

    return {
      success: true,
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

    return {
      success: false,
      message: `Unsupported Order Push Status: ${payload.data.status}`,
    };
  });
};
