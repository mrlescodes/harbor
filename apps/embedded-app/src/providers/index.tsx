"use client";

import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider } from "@shopify/polaris";

import { SessionProvider } from "./session-provider";

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = (props: ProvidersProps) => {
  const { children } = props;

  return (
    <AppProvider i18n={enTranslations}>
      <SessionProvider>{children}</SessionProvider>
    </AppProvider>
  );
};
