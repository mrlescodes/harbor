import { Effect } from "effect";

import { mapPrismaErrorToDatabaseError, PrismaClient } from "@harbor/database";

export class ShopeeIntegration extends Effect.Service<ShopeeIntegration>()(
  "ShopeeIntegration",
  {
    effect: Effect.gen(function* () {
      const prisma = yield* PrismaClient;

      const createConnection = (shopeeShopId: number, shopifyShop: string) => {
        return Effect.tryPromise({
          try: () => {
            return prisma.shopeeConnection.create({
              data: {
                shopeeShopId,
                shopifyShop,
                isConnected: true,
              },
            });
          },
          catch: mapPrismaErrorToDatabaseError,
        });
      };

      const getShopifyShopByShopeeId = (shopeeShopId: number) => {
        return Effect.tryPromise({
          try: () => {
            return prisma.shopeeConnection.findUnique({
              where: {
                shopeeShopId,
              },
              select: {
                shopifyShop: true,
                isConnected: true,
              },
            });
          },
          catch: mapPrismaErrorToDatabaseError,
        });
      };

      const getConnectionByShopeeId = (shopeeShopId: number) => {
        return Effect.tryPromise({
          try: () => {
            return prisma.shopeeConnection.findUnique({
              where: {
                shopeeShopId,
              },
            });
          },
          catch: mapPrismaErrorToDatabaseError,
        });
      };

      const getConnectionByShopifyShop = (shopifyShop: string) => {
        return Effect.tryPromise({
          try: () => {
            return prisma.shopeeConnection.findUnique({
              where: {
                shopifyShop,
              },
            });
          },
          catch: mapPrismaErrorToDatabaseError,
        });
      };

      const createMarketplaceProductMapping = (mapping: {
        shopifyProductId: string;
        shopifyVariantId: string;
        marketplaceProductId: number;
        marketplaceVariantId?: number;
      }) => {
        return Effect.tryPromise({
          try: () => {
            return prisma.marketplaceProductMapping.upsert({
              where: {
                shopifyProductId_shopifyVariantId: {
                  shopifyProductId: mapping.shopifyProductId,
                  shopifyVariantId: mapping.shopifyVariantId,
                },
              },
              update: {
                marketplaceProductId: mapping.marketplaceProductId,
                marketplaceVariantId: mapping.marketplaceVariantId,
              },
              create: {
                shopifyProductId: mapping.shopifyProductId,
                shopifyVariantId: mapping.shopifyVariantId,
                marketplaceProductId: mapping.marketplaceProductId,
                marketplaceVariantId: mapping.marketplaceVariantId,
              },
            });
          },
          catch: mapPrismaErrorToDatabaseError,
        });
      };

      const createMarketplaceProductMappings = (
        mappings: {
          shopifyProductId: string;
          shopifyVariantId: string;
          marketplaceProductId: number;
          marketplaceVariantId?: number;
        }[],
      ) => {
        const upsertPromises = mappings.map((mapping) => {
          return prisma.marketplaceProductMapping.upsert({
            where: {
              shopifyProductId_shopifyVariantId: {
                shopifyProductId: mapping.shopifyProductId,
                shopifyVariantId: mapping.shopifyVariantId,
              },
            },
            update: {
              marketplaceProductId: mapping.marketplaceProductId,
              marketplaceVariantId: mapping.marketplaceVariantId,
            },
            create: {
              shopifyProductId: mapping.shopifyProductId,
              shopifyVariantId: mapping.shopifyVariantId,
              marketplaceProductId: mapping.marketplaceProductId,
              marketplaceVariantId: mapping.marketplaceVariantId,
            },
          });
        });

        return Effect.tryPromise({
          try: () => prisma.$transaction(upsertPromises),
          catch: mapPrismaErrorToDatabaseError,
        });
      };

      const getMappingsByMarketplaceIds = (
        products: {
          marketplaceProductId: number;
          marketplaceVariantId?: number;
        }[],
      ) => {
        return Effect.tryPromise({
          try: () => {
            const whereConditions = products.map((product) => ({
              marketplaceProductId: product.marketplaceProductId,
              ...(product.marketplaceVariantId && {
                marketplaceVariantId: product.marketplaceVariantId,
              }),
            }));

            return prisma.marketplaceProductMapping.findMany({
              where: {
                OR: whereConditions,
              },
            });
          },
          catch: mapPrismaErrorToDatabaseError,
        });
      };

      const getMappingsByShopifyIds = (
        products: {
          shopifyProductId: string;
        }[],
      ) => {
        return Effect.tryPromise({
          try: () => {
            const whereConditions = products.map((product) => ({
              shopifyProductId: product.shopifyProductId,
            }));

            return prisma.marketplaceProductMapping.findMany({
              where: {
                OR: whereConditions,
              },
            });
          },
          catch: mapPrismaErrorToDatabaseError,
        });
      };

      return {
        createConnection,
        getShopifyShopByShopeeId,
        getConnectionByShopeeId,
        getConnectionByShopifyShop,
        createMarketplaceProductMapping,
        createMarketplaceProductMappings,
        getMappingsByMarketplaceIds,
        getMappingsByShopifyIds,
      };
    }),

    dependencies: [PrismaClient.Default],
  },
) {}
