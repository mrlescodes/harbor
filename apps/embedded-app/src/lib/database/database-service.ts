import { prisma } from "@harbor/database";

// TODO: Change to domain package
// TODO: Handle errors

const initialiseStore = async (shop: string) => {
  return prisma.shopifyStore.upsert({
    where: { shop },
    update: {
      isActive: true,
    },
    create: {
      shop,
      isActive: true,
    },
  });
};

const findStore = async (shop: string) => {
  return prisma.shopifyStore.findUnique({
    where: { shop },
  });
};

export const databaseService = {
  initialiseStore,
  findStore,
};
