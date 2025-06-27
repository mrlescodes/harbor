"use client";

import { Page } from "@shopify/polaris";

import { ProductList } from "~/components/products/ProductList";

const PRODUCTS = [
  { id: "1", name: "Surfboard" },
  { id: "2", name: "Board" },
  { id: "3", name: "Rudder" },
  { id: "4", name: "Oar" },
];

export default function ProductsPage() {
  return (
    <Page title="Products">
      <ProductList products={PRODUCTS} />
    </Page>
  );
}
