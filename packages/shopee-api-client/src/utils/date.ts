import { addSeconds, getUnixTime, isPast, subMinutes } from "date-fns";

export const calculateExpiryDate = (expiresIn: number) => {
  return addSeconds(new Date(), expiresIn);
};

export const getCurrentTimestamp = () => getUnixTime(Date.now());

export const isTokenExpired = (expiresAt: Date, bufferMinutes = 5): boolean => {
  const expiryWithBuffer = subMinutes(expiresAt, bufferMinutes);
  return isPast(expiryWithBuffer);
};
