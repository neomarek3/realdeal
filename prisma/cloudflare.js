// This file configures the Prisma client for Cloudflare
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Increase connection timeout for Cloudflare
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      engineConfig: {
        // Increase connection timeout for Cloudflare
        connectionTimeout: 10000,
        // Enable connection pooling for Cloudflare
        poolTimeout: 20,
        pool: {
          min: 1,
          max: 5,
        },
      },
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 