"use client";

import { useState } from "react";
import { useAppBridge } from "@/components/app-bridge";
import { getShopeeAuthUrl } from "@/lib/shopee/actions";
import { Button } from "@shopify/polaris";

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
    <Button onClick={handleConnect} disabled={isLoading}>
      {isLoading ? "Connecting..." : "Connect Shopee Store"}
    </Button>
  );
};
