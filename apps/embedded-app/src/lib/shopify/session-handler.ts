import type { Session as ShopifySession } from "@shopify/shopify-api";

import { prisma } from "@harbor/database";

import { encrypt } from "~/utils/crypto";

/**
 * Stores the session data into the database.
 */
const storeSession = async (session: ShopifySession) => {
  try {
    const encryptedAccessToken = session.accessToken
      ? encrypt(session.accessToken)
      : null;

    await prisma.shopifySession.upsert({
      where: { sessionId: session.id },
      update: {
        shop: session.shop,
        state: session.state,
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires,
        accessToken: encryptedAccessToken,
      },
      create: {
        sessionId: session.id,
        shop: session.shop,
        state: session.state,
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires,
        accessToken: encryptedAccessToken,
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to store session:", error);
    return false;
  }
};

export const sessionHandler = {
  storeSession,
};
