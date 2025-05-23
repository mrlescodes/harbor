import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Effect } from "effect";

import { ShopeeAuthClient } from "@harbor/shopee-api-client/auth";

import { runWithShopeeAuthClient } from "~/lib/shopee/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shop: string }> },
) {
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const shopId = searchParams.get("shop_id");

  const { shop } = await params;

  // Grab the part before .*
  const shopName = shop.split(".");

  // Validate required parameters
  if (!code || !shopId) {
    console.error("Missing required parameters: code or shop_id");

    // TODO: Redirect with failed auth params
    return NextResponse.redirect(
      `https://admin.shopify.com/store/${shopName[0]}/apps/wharf-next-app`,
    );
  }

  const program = Effect.gen(function* () {
    const client = yield* ShopeeAuthClient;

    return yield* client.getAccessToken(code, parseInt(shopId, 10));
  });

  const runnable = runWithShopeeAuthClient(program);

  // TODO: Only handling happy path ATM 0.o
  await Effect.runPromise(runnable);

  // TODO: Use app id to allow for easy renaming of app?
  return NextResponse.redirect(
    `https://admin.shopify.com/store/${shopName[0]}/apps/wharf-next-app`,
  );
}
