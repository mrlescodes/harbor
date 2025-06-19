import type { GetOrderDetailResponse } from "@harbor/shopee-api-client/api";

// TODO: Add better typing
export const transformOrder = (orderDetail: GetOrderDetailResponse) => {
  const shopeeOrders = orderDetail.response.order_list;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const order = shopeeOrders[0]!;

  const lineItems = order.item_list.map((item) => {
    return {
      title: item.item_name,
      priceSet: {
        shopMoney: {
          amount: item.model_original_price,
          currencyCode: "IDR",
        },
      },
      quantity: item.model_quantity_purchased,
    };
  });

  const totalValue = order.item_list.reduce((total, item) => {
    return total + item.model_original_price * item.model_quantity_purchased;
  }, 0);

  // Calculate 15% discount
  const discountPercentage = 0.15;
  const discountAmount = Math.round(totalValue * discountPercentage);

  return {
    customer: {
      toUpsert: {
        firstName: order.buyer_username,
        email: `shopee+${order.buyer_user_id}@matchabali.id`,
      },
    },
    lineItems,
    discountCode: {
      itemFixedDiscountCode: {
        amountSet: {
          shopMoney: {
            amount: discountAmount,
            currencyCode: "IDR",
          },
        },
        code: "Shopee Fees (15% estimate)",
      },
    },
    transactions: [
      {
        kind: "SALE",
        status: "SUCCESS",
        gateway: "Shopee",
        amountSet: {
          shopMoney: {
            // Transaction amount after discount
            amount: totalValue - discountAmount,
            currencyCode: "IDR",
          },
        },
      },
    ],
    tags: "Shopee",
  };
};
