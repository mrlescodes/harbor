"use server";

import { exchangeShopifyToken } from "./auth";
import { sessionHandler } from "./session-handler";

export const handleInitialLoad = async ({
  shop,
  idToken,
}: {
  shop: string | null;
  idToken: string | null;
}) => {
  try {
    if (idToken && shop) {
      const session = await exchangeShopifyToken({
        shop,
        sessionToken: idToken,
      });

      await sessionHandler.storeSession(session);
    }
  } catch (error) {
    console.log("Initial load error");
  }
};
