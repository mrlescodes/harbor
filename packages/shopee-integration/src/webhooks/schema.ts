import { Schema } from "effect";

import { OrderStatus } from "@harbor/shopee-api-client/api";

// Base webhook structure that all Shopee pushes share
const WebhookBase = Schema.Struct({
  shop_id: Schema.Int,
  code: Schema.Int,
  timestamp: Schema.Int,
});

/**
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

// Catch all for webhooks that are not implemented
export const GenericWebhook = Schema.Struct({
  ...WebhookBase.fields,
  data: Schema.Unknown,
});

export const ShopeeWebhook = Schema.Union(OrderStatusPush, GenericWebhook);

export type ShopeeWebhook = Schema.Schema.Type<typeof ShopeeWebhook>;
