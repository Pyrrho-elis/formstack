// packages/formstack/__tests__/index.test.ts

import FormStack from '../src/index';
import { z } from 'zod';

// Mock PrismaClient and its form.upsert method
const mockFormUpsert = jest.fn();
const mockPrisma = {
  form: {
    upsert: mockFormUpsert,
  },
};

describe('FormStack', () => {
  // This block is crucial for test isolation
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the static properties on FormStack before each test
    // @ts-ignore: Accessing private static for test reset
    FormStack['forms'].clear();
    // @ts-ignore: Accessing private static for test reset
    FormStack['config'] = null;
    // @ts-ignore: Accessing private static for test reset
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

  it('rejects duplicate forms', async () => {
    const form = FormStack.define({
      name: 'test',
      schema: z.object({ name: z.string().min(1) }),
    });
    await FormStack.register(form);
    await expect(FormStack.register(form)).rejects.toThrow(/already registered/);
  });

  it('configures Prisma storage and registers form', async () => {
    FormStack.configure({
      storage: { type: 'prisma', client: mockPrisma as any },
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