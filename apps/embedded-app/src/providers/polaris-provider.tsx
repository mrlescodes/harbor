"use client";

import "@shopify/polaris/build/esm/styles.css";

import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

type PolarisProviderProps = {
  children: React.ReactNode;
};

export const PolarisProvider = (props: PolarisProviderProps) => {
  const { children } = props;

  return <AppProvider i18n={enTranslations}>{children}</AppProvider>;
};
