import { prisma } from "@/lib/database/prisma";
import { encrypt } from "@/utils/crypto";
import { Session as ShopifySession } from "@shopify/shopify-api";

/**
 * Stores the session data into the database.
 */
const storeSession = async (session: ShopifySession) => {
  try {
    const encryptedAccessToken = session.accessToken
      ? encrypt(session.accessToken)
      : null;

    await prisma.session.upsert({
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
