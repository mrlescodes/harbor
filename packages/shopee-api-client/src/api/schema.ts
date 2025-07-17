import { Schema } from "effect";

import { ErrorResponse } from "../schema";

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
  /** Indonesian Rupiah (IDR). */
  Idr = "IDR",
}

/**
 * Get Order List Response
 */

export const GetOrderListSuccessResponse = Schema.Struct({
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

export const GetOrderListResponse = Schema.Union(
  ErrorResponse,
  GetOrderListSuccessResponse,
);

export type GetOrderListResponse = Schema.Schema.Type<
  typeof GetOrderListResponse
>;

/**
 * Get Order Detail Response
 */

export const OrderDetail = Schema.Struct({
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
});

export type OrderDetail = Schema.Schema.Type<typeof OrderDetail>;

export const GetOrderDetailSuccessResponse = Schema.Struct({
  response: Schema.Struct({
    order_list: Schema.Array(OrderDetail),
  }),
});

export const GetOrderDetailResponse = Schema.Union(
  ErrorResponse,
  GetOrderDetailSuccessResponse,
);

export type GetOrderDetailResponse = Schema.Schema.Type<
  typeof GetOrderDetailResponse
>;

/**
 * Get Escrow Detail Response
 */

export const OrderIncome = Schema.Struct({
  order_selling_price: Schema.Number,
  commission_fee: Schema.Number,
  service_fee: Schema.Number,
  shipping_seller_protection_fee_amount: Schema.Number,
  delivery_seller_protection_fee_premium_amount: Schema.Number,
  order_ams_commission_fee: Schema.Number,
});

export type OrderIncome = Schema.Schema.Type<typeof OrderIncome>;

export const GetEscrowDetailSuccessResponse = Schema.Struct({
  response: Schema.Struct({
    order_income: OrderIncome,
  }),
});

export const GetEscrowDetailResponse = Schema.Union(
  ErrorResponse,
  GetEscrowDetailSuccessResponse,
);

export type GetEscrowDetailResponse = Schema.Schema.Type<
  typeof GetEscrowDetailResponse
>;
