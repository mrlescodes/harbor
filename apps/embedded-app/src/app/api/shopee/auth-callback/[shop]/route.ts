import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Effect } from "effect";

import { ShopeeAuthClient } from "@harbor/shopee-api-client/auth";
import { ShopeeIntegration } from "@harbor/shopee-integration/integration";

import { env } from "~/env";
import { RuntimeServer } from "~/lib/runtime-server";

// TODO: Move to shopify utils
function validateShopDomain(shop: string) {
  return shop.endsWith(".myshopify.com");
}

// TODO: Move to shopify utils
function extractShopName(shop: string) {
  if (!validateShopDomain(shop)) {
    return null;
  }

  // Extract the shop name (part before .myshopify.com)
  const parts = shop.split(".");

  return parts[0] ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shop: string }> },
) {
  const { shop } = await params;

  // Validate shop parameter exists
  if (!shop) {
    // TODO: User friendly response and logging
    return NextResponse.json(
      { error: "Shop parameter is required" },
      { status: 400 },
    );
  }

  // Validate shop domain format
  if (!validateShopDomain(shop)) {
    // TODO: User friendly response and logging
    return NextResponse.json(
      { error: "Invalid shop domain. Must be a valid myshopify.com domain" },
      { status: 400 },
    );
  }

  // Extract shop name safely
  const shopName = extractShopName(shop);
  if (!shopName) {
    // TODO: User friendly response and logging
    return NextResponse.json(
      { error: "Invalid shop domain format" },
      { status: 400 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const shopId = searchParams.get("shop_id");

  // Validate required parameters
  if (!code || !shopId) {
    // TODO: Redirect with failed auth params and logging
    return NextResponse.redirect(
      `https://admin.shopify.com/store/${shopName}/apps/${env.NEXT_PUBLIC_SHOPIFY_API_KEY}`,
    );
  }

  const program = Effect.gen(function* () {
    const shopeeAuthClient = yield* ShopeeAuthClient;
    const shopeeIntegration = yield* ShopeeIntegration;

    yield* shopeeAuthClient.getAccessToken(code, parseInt(shopId, 10));

    yield* shopeeIntegration.createConnection(parseInt(shopId, 10), shop);
  });

  await RuntimeServer.runPromise(program);

  return NextResponse.redirect(
    `https://admin.shopify.com/store/${shopName}/apps/${env.NEXT_PUBLIC_SHOPIFY_API_KEY}`,
  );
}
