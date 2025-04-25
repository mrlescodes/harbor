import { createHmac } from "node:crypto";

export const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

export const generateSignature = (key: string, data: string) => {
  return createHmac("sha256", key).update(data).digest("hex");
};
