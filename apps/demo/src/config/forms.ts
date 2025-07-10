import FormStack from 'formstack';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

FormStack.configure({
  storage: { type: 'prisma', client: prisma },
  adapter: { type: 'nextjs', options: { autoRoute: true, dashboardPath: '/formstack-admin' } },
  plugins: [
    {
      name: 'toggle',
      onToggle: async (formName: string, enabled: boolean) => {
        await prisma.form.update({ where: { name: formName }, data: { enabled } });
      },
      analytics: async (formName: string) => {
        return { submissions: await prisma.formSubmission.count({ where: { formName } }) };
      },
    },
  ],
  styles: { default: 'tailwind' },
});