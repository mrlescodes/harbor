// TODO: Remove pre-launch
import { NextResponse } from "next/server";
import { Effect } from "effect";

import { ShopifyAPIClient } from "@harbor/shopify-api-client/api";

import { runWithShopifyAPIClient } from "~/lib/shopify/client";

export async function GET() {
  const program = Effect.gen(function* () {
    const sessionId = "offline_wharf-development.myshopify.com";

    const client = yield* ShopifyAPIClient;

    // Example order input
    const orderInput = {
      order: {
        lineItems: [
          {
            variantId: "gid://shopify/ProductVariant/51469774618934",
            quantity: 1,
          },
        ],
        discountCode: {
          itemFixedDiscountCode: {
            amountSet: {
              shopMoney: {
                amount: 2,
                currencyCode: "SGD",
              },
            },
            code: "FEES",
          },
        },
        transactions: [
          {
            kind: "SALE",
            status: "SUCCESS",
            gateway: "Shopee",
            amountSet: {
              shopMoney: {
                amount: 198,
                currencyCode: "SGD",
              },
            },
          },
        ],
        shippingAddress: {
          firstName: "Client",
          lastName: "Mega",
          address1: "123 Main St",
          city: "Toronto",
          province: "ON",
          country: "Canada",
          zip: "M5V 0H1",
        },
      },
    };

    const orderResponse = yield* client.createOrder(sessionId, orderInput);

    return { orderResponse };
  });

  const runnable = runWithShopifyAPIClient(program);

  const response = await Effect.runPromise(runnable);

  return NextResponse.json(response);
}
