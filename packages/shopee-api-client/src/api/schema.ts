import { Schema } from "effect";

// TODO: Align names with shopee api docs and review responses

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

/**
 * Order List Response
 *
 * @see https://open.shopee.com/documents/v2/v2.order.get_order_list?module=94&type=1
 */
export const GetOrderListResponse = Schema.Struct({
  error: Schema.String,
  message: Schema.String,
  response: Schema.Struct({
    more: Schema.Boolean,
    next_cursor: Schema.String,
    order_list: Schema.Array(
      Schema.Struct({
        order_sn: Schema.String,
      }),
    ),
  }),
  request_id: Schema.String,
});

/**
 * Product List Response
 *
 * @see https://open.shopee.com/documents/v2/v2.product.get_item_list?module=89&type=1
 */
export const GetProductListResponse = Schema.Struct({
  error: Schema.String,
  message: Schema.String,
  warning: Schema.String,
  request_id: Schema.String,
  response: Schema.Struct({
    item: Schema.Array(Schema.Any), // TODO: { item_id: 1919431, item_status: 'NORMAL', update_time: 1745300200 }
    total_count: Schema.Int,
    has_next_page: Schema.Boolean,
    next: Schema.String,
  }),
});

/**
 * Product Detail Response
 *
 * @see https://open.shopee.com/documents/v2/v2.product.get_item_base_info?module=89&type=1
 */
export const GetProductDetailResponse = Schema.Struct({
  error: Schema.String,
  message: Schema.String,
  warning: Schema.String,
  request_id: Schema.String,
  response: Schema.Struct({
    item_list: Schema.Array(Schema.Any), // TODO: { item_id: 1919431, item_status: 'NORMAL', update_time: 1745300200 }
  }),
});
