import FormStack from '../src/index';
import { z } from 'zod';
import { PrismaClient } from '../src/generated/prisma';

// Mock PrismaClient
const mockFormUpsert = jest.fn();
const mockPrisma = {
  form: {
    upsert: mockFormUpsert,
    findUnique: jest.fn(),
  },
};
jest.mock('../src/generated/prisma', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('FormStack', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
    // Reset static FormStack state
    // @ts-ignore: Accessing private static for test reset
    FormStack['forms'].clear();
    // Optionally reset config/prisma if needed:
    FormStack['config'] = null;
    FormStack['prisma'] = null;
  });

  it('defines a form', () => {
    const form = FormStack.define({
      name: 'test',
      schema: z.object({ name: z.string().min(1) }),
    });
    expect(form.name).toBe('test');
    expect(form.schema).toBeInstanceOf(z.ZodObject);
  });

  it('rejects duplicate forms', () => {
    const form = FormStack.define({
      name: 'test',
      schema: z.object({ name: z.string().min(1) }),
    });
    FormStack.register(form);
    expect(() => FormStack.register(form)).toThrow(/already registered/);
  });

  it('configures Prisma storage and registers form', async () => {
    FormStack.configure({
      storage: { type: 'prisma', client: prisma },
      adapter: { type: 'nextjs', options: { autoRoute: true, dashboardPath: '/formstack-admin' } },
      plugins: [],
      styles: { default: 'tailwind' },
    });
    const form = FormStack.define({
      name: 'test',
      schema: z.object({ name: z.string().min(1) }),
    });
    await FormStack.register(form);
    expect(mockFormUpsert).toHaveBeenCalledWith({
      where: { name: 'test' },
      update: { schema: expect.any(String), enabled: true },
      create: { name: 'test', schema: expect.any(String), enabled: true },
    });
  });
});