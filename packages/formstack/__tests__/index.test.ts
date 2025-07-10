import FormStack from '../src/index';
     import { z } from 'zod';

     describe('FormStack', () => {
       it('defines a form', () => {
         const form = FormStack.define({
           name: 'test',
           schema: z.object({ name: z.string().min(1) }),
         });
         expect(form.name).toBe('test');
       });

       it('rejects duplicate forms', () => {
         const form = FormStack.define({
           name: 'test',
           schema: z.object({ name: z.string().min(1) }),
         });
         FormStack.register(form);
         expect(() => FormStack.register(form)).toThrow(/already registered/);
       });

       it('configures SQLite storage', () => {
         FormStack.configure({
           storage: { type: 'sqlite', path: ':memory:' },
           adapter: { type: 'nextjs', options: { autoRoute: true, dashboardPath: '/formstack-admin' } },
           plugins: [],
           styles: { default: 'tailwind' },
         });
         const form = FormStack.define({
           name: 'test',
           schema: z.object({ name: z.string().min(1) }),
         });
         FormStack.register(form);
         // Additional checks for SQLite can be added here
       });
     });