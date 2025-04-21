"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { handleInitialLoad } from "@/lib/shopify/actions";

type SessionProviderProps = {
  children: React.ReactNode;
};

export const SessionProvider = (props: SessionProviderProps) => {
  const { children } = props;

  const searchParams = useSearchParams();

  useEffect(() => {
    const shop = searchParams.get("shop");
    const idToken = searchParams.get("id_token");

    handleInitialLoad({ shop, idToken });
  }, [searchParams]);

  return <>{children}</>;
};
