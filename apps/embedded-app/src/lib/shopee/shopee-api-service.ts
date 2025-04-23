import { env } from "@/env";
import { getCurrentTimestamp } from "@/utils/date";
import { createBaseString, generateSignature } from "./auth";

export interface ShopeeTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number; // seconds until token expires
  error?: string;
  message?: string;
}

export interface ShopeeRefreshResponse extends ShopeeTokenResponse {}

// Helper function to create error response
const createErrorResponse = (message: string): ShopeeTokenResponse => {
  return {
    access_token: "",
    refresh_token: "",
    expire_in: 0,
    error: "error",
    message,
  };
};

const exchangeCodeForTokens = async (
  code: string,
  shopId: string
): Promise<ShopeeTokenResponse> => {
  const partnerId = env.SHOPEE_PARTNER_ID;
  const partnerKey = env.SHOPEE_PARTNER_KEY;
  const apiBaseUrl = env.SHOPEE_API_BASE_URL;
  const apiPath = "/api/v2/auth/token/get";

  const timestamp = getCurrentTimestamp();

  const baseString = createBaseString(partnerId, apiPath, timestamp);
  const signature = generateSignature(baseString, partnerKey);

  const url = new URL(`${apiBaseUrl}${apiPath}`);
  url.searchParams.append("partner_id", partnerId.toString());

  url.searchParams.append("timestamp", timestamp.toString());
  url.searchParams.append("sign", signature);

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shop_id: parseInt(shopId, 10),
        partner_id: parseInt(partnerId, 10),
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Shopee API error:", data);
      return createErrorResponse(data.error || "API error");
    }

    return data as ShopeeTokenResponse;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

// Export functions as an object
export const shopeeApiService = {
  exchangeCodeForTokens,
};
