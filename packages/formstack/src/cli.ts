#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .command('init')
  .description('Initialize FormStack in a project')
  .action(() => {
    const configPath = path.join(process.cwd(), 'src/config/forms.ts');
    if (fs.existsSync(configPath)) {
      console.error('Error: src/config/forms.ts already exists');
      process.exit(1);
    }
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, `
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
    `.trim());
    console.log('Created src/config/forms.ts');

    const prismaPath = path.join(process.cwd(), 'prisma/schema.prisma');
    if (!fs.existsSync(prismaPath)) {
      fs.mkdirSync(path.dirname(prismaPath), { recursive: true });
      fs.writeFileSync(prismaPath, `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Form {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  schema    Json
  enabled   Boolean  @default(true)
}

model FormSubmission {
  id        Int      @id @default(autoincrement())
  formName  String
  data      Json
  createdAt DateTime @default(now())
}
      `.trim());
      console.log('Created prisma/schema.prisma');
    } else {
      console.log('prisma/schema.prisma already exists, skipping creation');
    }
  });

program.parse(process.argv);