import { shopify } from "@/lib/shopify/shopify-api";
import { RequestedTokenType } from "@shopify/shopify-api";

export const exchangeShopifyToken = async ({
  shop,
  sessionToken,
  online = false,
}: {
  shop: string;
  sessionToken: string;
  online?: boolean;
}) => {
  try {
    const response = await shopify.auth.tokenExchange({
      shop,
      sessionToken,

      requestedTokenType: online
        ? RequestedTokenType.OnlineAccessToken
        : RequestedTokenType.OfflineAccessToken,
    });

    return response.session;
  } catch (error) {
    console.error("Shopify token exchange error:", error);
    throw error;
  }
};
