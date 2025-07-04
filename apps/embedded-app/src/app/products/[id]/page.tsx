"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Card, Page, Text } from "@shopify/polaris";

import { useAppBridge } from "~/components/app-bridge";
import { MarketplaceProductMappingForm } from "~/components/products/MarketplaceProductMappingForm";
import {
  createMarketplaceProductMapping,
  createMarketplaceProductMappings,
} from "~/lib/shopee/actions";
import { getProductMappingData } from "~/lib/shopify/actions";

export default function ProductPage() {
  const { id } = useParams();

  const app = useAppBridge();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const shop = app.config.shop;

    if (!shop) {
      setError("Shop not available");
      return;
    }

    if (!id || typeof id !== "string") {
      setError("Missing id");
      return;
    }

    const getProductDetail = () => {
      startTransition(async () => {
        const result = await getProductMappingData(shop, id);

        if (result.success) {
          const productData = result.result;
          setProduct(productData);
        } else {
          setError(result.error || "Failed to load product");
        }
      });
    };

    getProductDetail();
  }, [app.config.shop, id]);

  const handleBack = () => {
    router.push("/");
  };

  // TODO: UI Feedback
  const handleSubmit = async (formValues: unknown) => {
    const shopifyProductId = product?.shopifyProductId as string;
    const shopifyVariantId = product?.variants[0].shopifyVariantId as string;

    if (product?.hasOnlyDefaultVariant) {
      const mapping = {
        shopifyProductId: shopifyProductId,
        shopifyVariantId: shopifyVariantId,
        marketplaceProductId: parseInt(formValues.marketplaceProductId),
      };

      const result = await createMarketplaceProductMapping(mapping);

      if (result.success) {
        console.log("Success");
      }
    } else {
      const marketplaceProductId = formValues.marketplaceProductId;

      // Iterate through form variants and combine with original product data
      const mappingsToSubmit = formValues.variants
        .map((formVariant) => {
          // TODO: DANGER ZONE, extract logic Marketplace variant NEED to have a variant id
          if (!formVariant.marketplaceVariantId) {
            return null;
          }

          return {
            shopifyProductId: shopifyProductId,
            shopifyVariantId: formVariant.shopifyVariantId,
            marketplaceProductId: parseInt(marketplaceProductId, 10),
            marketplaceVariantId: parseInt(
              formVariant.marketplaceVariantId,
              10,
            ),
          };
        })
        .filter(Boolean);

      const result = await createMarketplaceProductMappings(mappingsToSubmit);

      if (result.success) {
        console.log("Success");
      }
    }
  };

  if (isPending) {
    return (
      <Page title="Products">
        <div>Loading product detail...</div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Products">
        <div>Error: {error}</div>
      </Page>
    );
  }

  return (
    <Page backAction={{ onAction: () => handleBack() }} title="Product Page">
      <Card>
        <Box paddingBlockEnd="400">
          <Text as="h2" variant="heading2xl">
            Link to existing shopee product
          </Text>
        </Box>

        <Box>
          <MarketplaceProductMappingForm
            hasOnlyDefaultVariant={product?.hasOnlyDefaultVariant}
            variants={product?.variants}
            marketplaceProductId={product?.marketplaceProductId}
            onSubmit={handleSubmit}
          />
        </Box>
      </Card>
    </Page>
  );
}
