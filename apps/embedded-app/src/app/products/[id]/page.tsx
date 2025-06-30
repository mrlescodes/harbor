"use client";

// TODO: Replace with shadcn form setup
// TODO: Display UI feedback
import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Form,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";

import { useAppBridge } from "~/components/app-bridge";
import { createMarketplaceProductMapping } from "~/lib/shopee/actions";
import { findProductById } from "~/lib/shopify/actions";

export default function ProductPage() {
  const { id } = useParams();

  const app = useAppBridge();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form data for single variant products
  const [formData, setFormData] = useState({
    shopeeProductId: "",
    shopeeVariantId: "",
  });

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
        const result = await findProductById(shop, id);

        if (result.success) {
          const productData = result.result.data?.productByIdentifier;
          console.log(result);
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

  const handleSingleVariantSubmit = async () => {
    const shopifyProductId = product.id as string;
    const shopifyVariantId = product.variants.edges[0].node.id as string;

    const mapping = {
      shopifyProductId: shopifyProductId,
      shopifyVariantId: shopifyVariantId,
      marketplaceProductId: parseInt(formData.shopeeProductId),
    };

    const result = await createMarketplaceProductMapping(mapping);

    if (result.success) {
      console.log("Success");
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
          <Text as="h2" variant="headingSm">
            Link to existing product
          </Text>
        </Box>

        <Box maxWidth="800px">
          <Text as="h1">Product: {product?.title}</Text>

          {product?.hasOnlyDefaultVariant && (
            <>
              <Text as="h3" variant="headingMd">
                Default Product
              </Text>
              <Form onSubmit={handleSingleVariantSubmit}>
                <FormLayout>
                  <TextField
                    label="Shopee Product ID"
                    name="shopeeProductId"
                    value={formData.shopeeProductId}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        shopeeProductId: value,
                      }))
                    }
                    autoComplete="off"
                    requiredIndicator
                  />

                  <Button fullWidth variant="primary" submit>
                    Create Mapping
                  </Button>
                </FormLayout>
              </Form>
            </>
          )}
        </Box>
      </Card>
    </Page>
  );
}
