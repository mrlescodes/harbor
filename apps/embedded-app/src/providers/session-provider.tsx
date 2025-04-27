"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { handleInitialLoad } from "@/lib/shopify/actions";

type SessionProviderProps = {
  children: React.ReactNode;
};

function SessionHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const shop = searchParams.get("shop");
    const idToken = searchParams.get("id_token");

    handleInitialLoad({ shop, idToken });
  }, [searchParams]);

  return null;
}

export const SessionProvider = (props: SessionProviderProps) => {
  const { children } = props;

  return (
    <>
      <Suspense fallback={null}>
        <SessionHandler />
      </Suspense>

      {children}
    </>
  );
};
