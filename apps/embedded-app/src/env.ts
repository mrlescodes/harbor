import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

export const env = createEnv({
  extends: [vercel()],

  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },

  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_ENCRYPTION_KEY: z.string().min(64).max(64),

    SHOPIFY_API_SECRET: z.string().min(1),
    SHOPIFY_ACCESS_SCOPES: z.string().min(1),

    SHOPEE_PARTNER_ID: z.string().transform((val) => parseInt(val, 10)),
    SHOPEE_PARTNER_KEY: z.string().min(64).max(64),
    SHOPEE_API_BASE_URL: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SHOPIFY_API_KEY: z.string().min(1),
    NEXT_PUBLIC_SHOPIFY_APP_URL: z.string().url(),
  },

  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
    NEXT_PUBLIC_SHOPIFY_APP_URL: process.env.NEXT_PUBLIC_SHOPIFY_APP_URL,
  },
});
