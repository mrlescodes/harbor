"use client";

import { useEffect, useState, useTransition } from "react";
import { Page } from "@shopify/polaris";

import { useAppBridge } from "~/components/app-bridge";
import { ProductList } from "~/components/products/ProductList";
import { getProducts } from "~/lib/shopify/actions";

export default function Products() {
  const app = useAppBridge();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const shop = app.config.shop;
    if (!shop) {
      setError("Shop is not configured");
      return;
    }

    const fetchProducts = () => {
      startTransition(async () => {
        const result = await getProducts(shop);

        if (result.success) {
          // TODO: Response type generation
          setProducts(result.products);
        } else {
          setError(result.error || "Failed to load products");
        }
      });
    };

    fetchProducts();
  }, [app.config.shop]);

  if (isPending) {
    return (
      <Page title="Products">
        <div>Loading products...</div>
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
    <Page title="Products">
      <ProductList products={products} />
    </Page>
  );
}
