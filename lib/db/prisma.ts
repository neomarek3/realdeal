// This file provides a singleton instance of the Prisma client or a mock version
import { PrismaClient } from '@prisma/client';

// Define a mock PrismaClient for environments where we can't connect to a database
class MockPrismaClient {
  constructor() {
    return new Proxy(this, {
      get: (target, prop) => {
        // Return a mock function for any method call
        if (typeof prop === 'string') {
          return {
            findMany: async () => [],
            findUnique: async () => null,
            create: async (data: any) => data.data,
            update: async (data: any) => data.data,
            delete: async () => ({}),
            count: async () => 0,
            createMany: async () => ({ count: 0 }),
          }[prop] || (() => this);
        }
        return undefined;
      },
    });
  }
}

declare global {
  var prisma: PrismaClient | any;
}

// Determine if we should use a real or mock client
const shouldUseMockClient = process.env.VERCEL || !process.env.DATABASE_URL;

// Create the appropriate client
let prismaClient;

if (shouldUseMockClient) {
  console.warn('Using mock Prisma client - no database connection will be made');
  prismaClient = new MockPrismaClient();
} else {
  try {
    prismaClient = global.prisma || new PrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prismaClient;
    }
  } catch (e) {
    console.warn('Failed to initialize Prisma client, using mock client instead');
    prismaClient = new MockPrismaClient();
  }
}

export default prismaClient; 