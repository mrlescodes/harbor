import { Schema } from "effect";

import { OrderStatus } from "@harbor/shopee-api-client/api";

/**
 * Base webhook
 *
 * @description Fields that all push notifications have in common
 */

const WebhookBase = Schema.Struct({
  shop_id: Schema.Int,
  code: Schema.Int,
  timestamp: Schema.Int,
});

/**
 * Order Status Push
 *
 * @see https://open.shopee.com/push-mechanism/1
 */

export const OrderStatusPush = Schema.Struct({
  ...WebhookBase.fields,
  code: Schema.Literal(3),
  data: Schema.Struct({
    ordersn: Schema.String,
    status: Schema.Enums(OrderStatus),
  }),
});

export type OrderStatusPush = Schema.Schema.Type<typeof OrderStatusPush>;

export const isOrderStatusPush = Schema.is(OrderStatusPush);

/**
 * Generic Webhook
 *
 * @description For webhooks that are not implemented
 */

export const GenericWebhook = Schema.Struct({
  ...WebhookBase.fields,
  data: Schema.Unknown,
});

/**
 * Shopee Webhook
 */

export const ShopeeWebhook = Schema.Union(OrderStatusPush, GenericWebhook);

export type ShopeeWebhook = Schema.Schema.Type<typeof ShopeeWebhook>;

export const validateShopeeWebhook = (rawData: unknown) =>
  Schema.decodeUnknown(ShopeeWebhook)(rawData);
