import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __singletonPrisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient =
  global.__singletonPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__singletonPrisma = prisma;
}


