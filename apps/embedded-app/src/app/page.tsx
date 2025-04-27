"use client";

import { Card, Page } from "@shopify/polaris";

import { ShopeeConnectionButton } from "@/components/shopee-connection-button";

export default function Home() {
  return (
    <Page title="Settings">
      <Card>
        <ShopeeConnectionButton />
      </Card>
    </Page>
  );
}
