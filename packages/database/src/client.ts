import { Effect } from "effect";

import { PrismaClient as GeneratedPrismaClient } from "../generated/client";

const globalForPrisma = global as unknown as { prisma: GeneratedPrismaClient };

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const prisma = globalForPrisma.prisma || new GeneratedPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export class PrismaClient extends Effect.Service<PrismaClient>()(
  "PrismaClient",
  {
    succeed: prisma,
  },
) {}
