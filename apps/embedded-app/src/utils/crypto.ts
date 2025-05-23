import crypto from "node:crypto";

import { env } from "~/env";

// Encryption configuration
const ENCRYPTION_KEY = env.DATABASE_ENCRYPTION_KEY;
const IV_LENGTH = 16;

/**
 * Encrypts string using AES-256-CBC
 */
export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv,
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

/**
 * Decrypts string using AES-256-CBC
 */
export const decrypt = (text: string) => {
  const [ivHex, encryptedHex] = text.split(":");

  if (!ivHex || !encryptedHex) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv,
  );

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
