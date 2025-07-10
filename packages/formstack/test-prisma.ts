// packages/formstack/test-prisma.ts
import { PrismaClient } from './src/generated/prisma/index.ts';

const prisma = new PrismaClient();
async function test() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');
  } catch (error) {
    console.error('Connection failed:', error);
    // Add more detailed logging for the error object
    console.error('Error details (stringified):', JSON.stringify(error, null, 2));
    console.error('Error details (inspect):', require('util').inspect(error, { depth: null }));
  } finally {
    await prisma.$disconnect();
  }
}
test();