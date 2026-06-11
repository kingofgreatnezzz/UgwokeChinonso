// ================================================================
// Prisma client singleton for Next.js API routes
// ================================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// In Prisma v7, the datasource URL is configured via prisma.config.ts
// No need to pass it to the PrismaClient constructor
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
