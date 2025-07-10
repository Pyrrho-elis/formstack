import FormStack from '../src/index';
     import { z } from 'zod';
    //  import { PrismaClient } from '@prisma/client';
    import { PrismaClient } from '../src/generated/prisma';

     jest.mock('@prisma/client', () => {
       const mPrisma = {
         form: {
           upsert: jest.fn(),
           findUnique: jest.fn(),
         },
       };
       return { PrismaClient: jest.fn(() => mPrisma) };
     });

     describe('FormStack', () => {
       let prisma: PrismaClient;

       beforeEach(() => {
         prisma = new PrismaClient();
         jest.clearAllMocks();
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
         expect(prisma.form.upsert).toHaveBeenCalledWith({
           where: { name: 'test' },
           update: { schema: expect.any(String), enabled: true },
           create: { name: 'test', schema: expect.any(String), enabled: true },
         });
       });
     });