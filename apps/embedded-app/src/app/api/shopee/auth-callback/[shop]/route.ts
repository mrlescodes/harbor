import { NextResponse, type NextRequest } from "next/server";

import { shopeeApiService } from "@/lib/shopee/shopee-api-service";
import { databaseService } from "@/lib/shopify/database-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shop: string }> }
) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const shopId = searchParams.get("shop_id");

  const { shop } = await params;

  // Validate required parameters
  if (!code || !shopId) {
    console.error("Missing required parameters: code or shop_id");
    return;
  }

  const token = await shopeeApiService.exchangeCodeForTokens(code, shopId);

  await databaseService.storeShopeeCredentials(shop, shopId, token);

  // Grab the part before .com
  const shopName = shop.split(".");

  // TODO: Success / Fail param
  return NextResponse.redirect(
    `https://admin.shopify.com/store/${shopName[0]}/apps/wharf-next-app`
  );
}
