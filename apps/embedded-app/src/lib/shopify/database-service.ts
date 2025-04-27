import { prisma } from "../database/prisma";

// TODO: Change to domain repository when it grows?

const initialiseStore = async (shop: string) => {
  return prisma.store.upsert({
    where: { shop },
    update: {
      isActive: true,
    },
    create: {
      shop,
      isActive: true, // TODO: Review use of defaults?
    },
  });
};

const findStore = async (shop: string) => {
  return prisma.store.findUnique({
    where: { shop },
  });
};

export interface ShopeeTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number; // seconds until token expires
  error?: string;
  message?: string;
}

/**
 * Store Shopee OAuth credentials for a store
 */
const storeShopeeCredentials = async (
  shop: string,
  shopeeShopId: string,
  tokens: ShopeeTokenResponse,
) => {
  // Calculate token expiry date
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expire_in);

  return await prisma.store.update({
    where: { shop },
    data: {
      shopeeShopId: parseInt(shopeeShopId),
      shopeeAccessToken: tokens.access_token,
      shopeeRefreshToken: tokens.refresh_token,
      shopeeConnected: true,
      shopeeTokenExpiresAt: expiresAt,
    },
  });
};

export const databaseService = {
  initialiseStore,
  findStore,
  storeShopeeCredentials,
};
