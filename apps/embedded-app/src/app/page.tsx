"use client";

import { Card, Page } from "@shopify/polaris";

import { ShopeeConnectButton } from "@/components/shopee-connect-button";

export default function Home() {
  return (
    <Page title="Shopify App Template - Next.js">
      <Card>
        <ShopeeConnectButton />
      </Card>
    </Page>
  );
}
