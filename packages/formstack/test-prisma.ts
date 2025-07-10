// packages/formstack/test-prisma.ts
import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();
async function test() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
test();