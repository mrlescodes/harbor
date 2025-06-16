import { Schema } from "effect";

/**
 * @see https://open.shopee.com/developer-guide/229
 */
export enum OrderStatus {
  UNPAID = "UNPAID",
  READY_TO_SHIP = "READY_TO_SHIP",
  RETRY_SHIP = "RETRY_SHIP",
  IN_CANCEL = "IN_CANCEL",
  CANCELLED = "CANCELLED",
  PROCESSED = "PROCESSED",
  SHIPPED = "SHIPPED",
  TO_RETURN = "TO_RETURN",
  TO_CONFIRM_RECEIVE = "TO_CONFIRM_RECEIVE",
  COMPLETED = "COMPLETED",
}

export enum CurrencyCode {
  "IDR",
}

export const GetOrderListResponse = Schema.Struct({
  request_id: Schema.String,
  error: Schema.String,
  message: Schema.String,
  response: Schema.Struct({
    more: Schema.Boolean,
    order_list: Schema.Array(
      Schema.Struct({
        order_sn: Schema.String,
        order_status: Schema.Enums(OrderStatus),
      }),
    ),
    next_cursor: Schema.String,
  }),
});

export const GetOrderDetailResponse = Schema.Struct({
  request_id: Schema.String,
  error: Schema.String,
  message: Schema.String,
  response: Schema.Struct({
    order_list: Schema.Array(
      Schema.Struct({
        order_sn: Schema.String,
        currency: Schema.Enums(CurrencyCode),
        total_amount: Schema.Number,
        order_status: Schema.Enums(OrderStatus),
        buyer_user_id: Schema.Int,
        buyer_username: Schema.String,
        item_list: Schema.Array(
          Schema.Struct({
            item_id: Schema.Int,
            item_name: Schema.String,
            item_sku: Schema.String,
            model_id: Schema.Int,
            model_name: Schema.String,
            model_sku: Schema.String,
            model_quantity_purchased: Schema.Int,
            model_original_price: Schema.Number,
          }),
        ),
      }),
    ),
  }),
  warning: Schema.String,
});
