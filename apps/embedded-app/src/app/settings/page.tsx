"use client";

import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  Page,
  Text,
} from "@shopify/polaris";

import { ShopeeConnectionButton } from "~/components/shopee-connection-button";

export default function SettingsPage() {
  return (
    <Page>
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: "400", sm: "0" }}
            paddingInlineEnd={{ xs: "400", sm: "0" }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Marketplaces
              </Text>

              <Text as="p" variant="bodyMd">
                Connect to your marketplaces to enable order and product sync.
              </Text>
            </BlockStack>
          </Box>
          <Card>
            <Box paddingBlockEnd="400">
              <Text as="h3" variant="headingMd">
                Shopee
              </Text>
            </Box>

            <Card>
              <InlineGrid columns="1fr auto" alignItems="center">
                <Text as="p">
                  Shopee is <Text as="strong">disconnected</Text>
                </Text>

                <ShopeeConnectionButton />
              </InlineGrid>
            </Card>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
