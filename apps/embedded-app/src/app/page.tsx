"use client";

import { Button, Card, Page } from "@shopify/polaris";

export default function Home() {
  return (
    <Page title="Shopify App Template - Next.js">
      <Card>
        <Button onClick={() => alert("Button clicked!")}>Example button</Button>
      </Card>
    </Page>
  );
}
