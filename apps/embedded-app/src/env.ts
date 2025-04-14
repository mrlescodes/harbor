import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

export const env = createEnv({
  extends: [vercel()],

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
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
    NEXT_PUBLIC_SHOPIFY_APP_URL: process.env.NEXT_PUBLIC_SHOPIFY_APP_URL,
  },
});
