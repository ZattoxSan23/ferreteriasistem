import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const datasourceUrl =
  process.env.DATABASE_URL_POOLED ??
  process.env.NETLIFY_DATABASE_URL ??
  process.env.DATABASE_URL ??
  process.env.NETLIFY_DATABASE_URL_UNPOOLED;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(datasourceUrl ? { datasourceUrl } : undefined);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
