import type { OrderDetail, OrderIncome } from "@harbor/shopee-api-client/api";

export const buildShopifyOrder = (
  orderDetail: OrderDetail,
  orderIncome: OrderIncome,
) => {
  const lineItems = orderDetail.item_list.map((item) => ({
    title: item.item_name,
    priceSet: {
      shopMoney: {
        amount: item.model_original_price,
        currencyCode: orderDetail.currency,
      },
    },
    quantity: item.model_quantity_purchased,
    requiresShipping: true,
  }));

  const totalFees =
    orderIncome.commission_fee +
    orderIncome.delivery_seller_protection_fee_premium_amount +
    orderIncome.order_ams_commission_fee +
    orderIncome.service_fee +
    orderIncome.shipping_seller_protection_fee_amount;

  const discountCode = {
    itemFixedDiscountCode: {
      amountSet: {
        shopMoney: {
          amount: totalFees,
          currencyCode: orderDetail.currency,
        },
      },
      code: "Shopee Fees", // TODO: build a better breakdown string
    },
  };

  const transactions = [
    {
      kind: "SALE",
      status: "SUCCESS",
      gateway: "Shopee",
      amountSet: {
        shopMoney: {
          amount: orderIncome.order_selling_price - totalFees,
          currencyCode: orderDetail.currency,
        },
      },
    },
  ];

  // TODO: Magic string to const
  const metafields = [
    {
      namespace: "harbor",
      key: "shopee_order_id",
      value: orderDetail.order_sn,
    },
  ];

  const customer = {
    toUpsert: {
      firstName: orderDetail.buyer_username,
      email: `shopee+${orderDetail.buyer_user_id}@matchabali.id`,
    },
  };

  const tags = "Shopee";

  // Full order
  const shopeeOrder = {
    lineItems,
    discountCode,
    transactions,
    metafields,
    customer,
    tags,
  };

  return shopeeOrder;
};
