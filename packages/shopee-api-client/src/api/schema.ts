import { Schema } from "effect";

export enum OrderStatus {
  "UNPAID",
  "READY_TO_SHIP",
  "PROCESSED",
  "SHIPPED",
  "COMPLETED",
  "IN_CANCEL",
  "CANCELLED",
}

/**
 * Order List Response
 */
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
