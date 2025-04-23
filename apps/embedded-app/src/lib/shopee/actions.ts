"use server";

import { generateShoppeeAuthUrl } from "./auth";

/**
 * Server action to generate Shopee auth URL and return it
 */
export async function getShopeeAuthUrl(shop: string) {
  return generateShoppeeAuthUrl(shop);
}
