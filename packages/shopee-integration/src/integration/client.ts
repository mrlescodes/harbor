import { Effect } from "effect";

import { PrismaClient } from "@harbor/database";

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
          catch: () => {
            return new Error(
              `Failed to create connection for Shopee shop ${shopeeShopId} and Shopify shop ${shopifyShop}`,
            );
          },
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
          catch: () => {
            return new Error(
              `Failed to retrieve Shopify shop for Shopee ID: ${shopeeShopId}`,
            );
          },
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
          catch: () => {
            return new Error(
              `Failed to retrieve connection for Shopee ID: ${shopeeShopId}`,
            );
          },
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
          catch: () => {
            return new Error(
              `Failed to retrieve connection for Shopify shop: ${shopifyShop}`,
            );
          },
        });
      };

      const createMarketplaceProductMapping = (mapping: {
        shopifyProductId: string;
        shopifyVariantId: string;
        marketplaceProductId: number;
        marketplaceVariantId?: number;
      }) => {
        return Effect.tryPromise({
          try: () =>
            prisma.marketplaceProductMapping.upsert({
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
            }),
          catch: () => {
            return new Error(
              `Failed to create mapping for Shopify Product ${mapping.shopifyProductId} and Shopee Product ${mapping.marketplaceProductId}`,
            );
          },
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
          catch: () => {
            return new Error("Failed to create mappings");
          },
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
          catch: () => {
            return new Error(
              `Failed to retrieve marketplace mappings for ${products.length} items`,
            );
          },
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
          catch: () => {
            return new Error(
              `Failed to retrieve marketplace mappings for ${products.length} items`,
            );
          },
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
