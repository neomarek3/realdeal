// Specialized database connection handling for Cloudflare
import { PrismaClient } from '@prisma/client';

// Connection management for Cloudflare environment
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Configure for Cloudflare environment
    log: ['error'],
    errorFormat: 'minimal',
    // Optimize connection for Cloudflare
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pooling settings for Cloudflare
    // These help with the ephemeral nature of Cloudflare functions
    connectionLimit: 5,
    connectionTimeout: 10000,
    pool: {
      min: 1,
      max: 5,
    },
  });
};

// Ensure we don't create multiple connections in dev
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 