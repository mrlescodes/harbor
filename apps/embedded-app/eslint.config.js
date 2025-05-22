import baseConfig, { restrictEnvAccess } from "@harbor/eslint-config/base";
import nextjsConfig from "@harbor/eslint-config/nextjs";
import reactConfig from "@harbor/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
