import { Data } from "effect";

import { Prisma } from "../generated/client";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly reason:
    | "KnownRequestError"
    | "UnknownRequestError"
    | "RustPanicError"
    | "InitializationError"
    | "ValidationError"
    | "Unknown";
  readonly message: string;
  readonly cause?: unknown;
}> {}

export const mapPrismaErrorToDatabaseError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return new DatabaseError({
      reason: "KnownRequestError",
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return new DatabaseError({
      reason: "UnknownRequestError",
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new DatabaseError({
      reason: "RustPanicError",
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new DatabaseError({
      reason: "InitializationError",
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new DatabaseError({
      reason: "ValidationError",
      message: error.message,
      cause: error,
    });
  }

  return new DatabaseError({
    reason: "Unknown",
    message: "An unknown error occurred",
    cause: error,
  });
};
