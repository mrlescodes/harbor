import { Schema } from "effect";

// TODO: List all supported currency codes
export enum CurrencyCode {
  "IDR",
}

export enum OrderStatus {
  "UNPAID",
  "READY_TO_SHIP",
  "PROCESSED",
  "SHIPPED",
  "COMPLETED",
  "IN_CANCEL",
  "CANCELLED",
}

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
        payment_method: Schema.String,
        buyer_user_id: Schema.Int,
        buyer_username: Schema.String,
        recipient_address: Schema.Struct({
          name: Schema.String,
          phone: Schema.String,
          town: Schema.String,
          district: Schema.String,
          city: Schema.String,
          state: Schema.String,
          region: Schema.String,
          zipcode: Schema.String,
          full_address: Schema.String,
        }),
        item_list: Schema.Array(
          Schema.Struct({
            item_id: Schema.Int,
            item_name: Schema.String,
            item_sku: Schema.String,
            model_id: Schema.Int,
            model_name: Schema.String,
            model_sku: Schema.String,
            model_quantity_purchased: Schema.Int,
            order_item_id: Schema.Number,
          }),
        ),
      }),
    ),
  }),
  warning: Schema.String,
});
