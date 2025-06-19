import { Context, Layer } from "effect";

import { PrismaClient as GeneratedPrismaClient } from "../generated/client";

const globalForPrisma = global as unknown as { prisma: GeneratedPrismaClient };

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const prisma = globalForPrisma.prisma || new GeneratedPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export class PrismaClient extends Context.Tag("PrismaClient")<
  PrismaClient,
  GeneratedPrismaClient
>() {
  static readonly Live = Layer.succeed(PrismaClient, prisma);
}
