"use client";

import { ShopeeConnectionButton } from "~/components/shopee-connection-button";
import { Card, Page } from "@shopify/polaris";

export default function Home() {
  return (
    <Page title="Settings">
      <Card>
        <ShopeeConnectionButton />
      </Card>
    </Page>
  );
}
