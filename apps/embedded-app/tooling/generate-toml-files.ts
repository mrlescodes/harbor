import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import toml from "@iarna/toml";

import { env } from "../src/env";

// TODO: Error handling and more config from environment variables
// TODO: App config interface to prevent creating incorrect config files

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define app config
const appConfig = {
  client_id: env.NEXT_PUBLIC_SHOPIFY_API_KEY,
  name: "Wharf Next App",
  handle: "wharf-next-app",
  application_url: env.NEXT_PUBLIC_SHOPIFY_APP_URL,
  embedded: true,
  build: {
    include_config_on_deploy: true,
    automatically_update_urls_on_dev: true,
    dev_store_url: "wharf-development.myshopify.com",
  },
  webhooks: {
    api_version: "2025-04",
  },
  access_scopes: {
    scopes: env.SHOPIFY_ACCESS_SCOPES,
  },
  access: {
    admin: {
      direct_api_mode: "offline",
      embedded_app_direct_api_access: true,
    },
  },
  auth: {
    redirect_urls: [
      `${env.NEXT_PUBLIC_SHOPIFY_APP_URL}/auth/callback`,
      `${env.NEXT_PUBLIC_SHOPIFY_APP_URL}/auth/shopify/callback`,
      `${env.NEXT_PUBLIC_SHOPIFY_APP_URL}/api/auth/callback`,
    ],
  },
  pos: {
    embedded: false,
  },
};

// Define web config
const webConfig = {
  roles: ["frontend", "backend"],
  commands: {
    dev: "pnpm run dev",
  },
};

// Convert app config to TOML format
const appTomlContent = toml.stringify(appConfig);

// Convert web config to TOML format
const webTomlContent = toml.stringify(webConfig);

// Write app config to file
const appOutputPath = path.join(__dirname, "..", "shopify.app.toml");
fs.writeFileSync(appOutputPath, appTomlContent);
console.log(`Successfully generated shopify.app.toml at ${appOutputPath}`);

// Write web config to file
const webOutputPath = path.join(__dirname, "..", "shopify.web.toml");
fs.writeFileSync(webOutputPath, webTomlContent);
console.log(`Successfully generated shopify.web.toml at ${webOutputPath}`);
