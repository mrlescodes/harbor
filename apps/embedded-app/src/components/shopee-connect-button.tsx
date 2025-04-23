"use client";

import { useState } from "react";
import { Button } from "@shopify/polaris";

import { useAppBridge } from "@/components/app-bridge";
import { getShopeeAuthUrl } from "@/lib/shopee/actions";

export const ShopeeConnectButton = () => {
  const app = useAppBridge();

  const [isLoading, setIsLoading] = useState(false);

  // TODO: Put inside a modal
  const handleConnect = async () => {
    setIsLoading(true);

    if (!app.config.shop) {
      return;
    }

    try {
      const shopeeAuthUrl = await getShopeeAuthUrl(app.config.shop);

      open(shopeeAuthUrl, "_top");
    } catch (error) {
      console.error("Failed to connect with Shopee:", error);
      // Handle error as needed
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Add check for is connected and show disconnect instead
  return (
    <Button onClick={handleConnect} disabled={isLoading}>
      {isLoading ? "Connecting..." : "Connect Shopee Store"}
    </Button>
  );
};
