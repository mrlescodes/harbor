import { createHmac } from "node:crypto";

// TODO: Move to utils package

export const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

export const generateSignature = (key: string, data: string) => {
  return createHmac("sha256", key).update(data).digest("hex");
};

export const calculateExpiryDate = (expiresIn?: number): Date => {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + (expiresIn ?? 3600));
  return expiresAt;
};
