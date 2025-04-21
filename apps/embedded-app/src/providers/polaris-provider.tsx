"use client";

import "@shopify/polaris/build/esm/styles.css";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider } from "@shopify/polaris";

type PolarisProviderProps = {
  children: React.ReactNode;
};

export const PolarisProvider = (props: PolarisProviderProps) => {
  const { children } = props;

  return <AppProvider i18n={enTranslations}>{children}</AppProvider>;
};
