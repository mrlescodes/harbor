import { prisma } from "@harbor/database";

// TODO: Change to domain package

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

export const databaseService = {
  initialiseStore,
  findStore,
};
