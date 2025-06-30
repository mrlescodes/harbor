"use client";

import { useState } from "react";
import { Button } from "@shopify/polaris";

import { useAppBridge } from "~/components/app-bridge";
import { getShopeeAuthUrl } from "~/lib/shopee/actions";

export const ShopeeConnectionButton = () => {
  const app = useAppBridge();

  const [isLoading, setIsLoading] = useState(false);

  // TODO: Move to confirmation modal
  const handleConnect = async () => {
    setIsLoading(true);

    if (!app.config.shop) {
      return;
    }

    try {
      // TODO: Route endpoint
      const shopeeAuthUrl = await getShopeeAuthUrl(app.config.shop);

      open(shopeeAuthUrl, "_top");
    } catch (error) {
      console.error("Failed to connect with Shopee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Add support for disconnect
  return (
    <Button variant="primary" onClick={handleConnect} disabled={isLoading}>
      {isLoading ? "Connecting..." : "Connect"}
    </Button>
  );
};
