// TODO: Move to api service package

import { createHmac } from "node:crypto";

import { env } from "@/env";
import { getCurrentTimestamp } from "@/utils/date";

export const createBaseString = (
  partnerId: string,
  apiPath: string,
  timestamp: number
) => {
  return `${partnerId}${apiPath}${timestamp}`;
};

export const generateSignature = (baseString: string, partnerKey: string) => {
  return createHmac("sha256", partnerKey).update(baseString).digest("hex");
};

interface AuthUrlParams {
  partnerId: string;
  timestamp: number;
  signature: string;
  redirectUrl: string;
}

const buildAuthUrl = (
  baseUrl: string,
  apiPath: string,
  params: AuthUrlParams
) => {
  const url = new URL(`${baseUrl}${apiPath}`);
  url.searchParams.append("partner_id", params.partnerId.toString());
  url.searchParams.append("redirect", params.redirectUrl);
  url.searchParams.append("timestamp", params.timestamp.toString());
  url.searchParams.append("sign", params.signature);
  return url.toString();
};

export const generateShoppeeAuthUrl = (shop: string) => {
  // NOTES: Baked here to avoid reading env variables all over the place.
  // Might change my mind when I write tests
  const partnerId = env.SHOPEE_PARTNER_ID;
  const partnerKey = env.SHOPEE_PARTNER_KEY;
  const appURL = env.NEXT_PUBLIC_SHOPIFY_APP_URL;
  const apiBaseUrl = env.SHOPEE_API_BASE_URL;

  const apiPath = "/api/v2/shop/auth_partner";

  const timestamp = getCurrentTimestamp();

  const baseString = createBaseString(partnerId, apiPath, timestamp);
  const signature = generateSignature(baseString, partnerKey);

  const authRedirectUrl = `${appURL}/api/shopee/auth-callback/${shop}`;

  return buildAuthUrl(apiBaseUrl, apiPath, {
    partnerId,
    timestamp,
    signature,
    redirectUrl: authRedirectUrl,
  });
};
