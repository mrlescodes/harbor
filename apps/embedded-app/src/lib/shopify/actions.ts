"use server";

import { exchangeShopifyToken } from "./auth";
import { databaseService } from "./database-service";
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

      const store = await databaseService.findStore(shop);

      // If the store does not exist it's a first install. If it exists but is not active it's a re-install
      if (!store || !store.isActive) {
        await databaseService.initialiseStore(shop);
      }
    }
  } catch (error) {
    console.log("Initial load error");
  }
};
