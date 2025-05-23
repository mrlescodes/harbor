// TODO: Remove pre-launch
import { NextResponse } from "next/server";
import { Effect } from "effect";

import { ShopeeAPIClient } from "@harbor/shopee-api-client/api";

import { runWithShopeeAPIClient } from "~/lib/shopee/client";

export async function GET() {
  const program = Effect.gen(function* () {
    const shopId = 140380;

    const client = yield* ShopeeAPIClient;

    const productList = yield* client.getProductList(shopId);

    const productDetail = yield* client.getProductDetail(shopId, {
      itemIds: [1919431],
    });

    return { productList, productDetail };
  });

  const runnable = runWithShopeeAPIClient(program);

  const response = await Effect.runPromise(runnable);

  return NextResponse.json(response);
}
