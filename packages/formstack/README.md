 A TypeScript-based, open-source, self-hosted form management library with PostgreSQL/Prisma storage and a toggle plugin.

 ## Getting Started

 ### Prerequisites
 - Node.js >= 16
 - pnpm >= 10.8.1
 - PostgreSQL

 ### Installation
 1. **Install FormStack**:
    ```bash
    npm install formstack @prisma/client zod
    ```
 2. **Initialize FormStack**:
    Run the CLI in your Next.js project:
    ```bash
    npx formstack init
    ```
    This creates:
    - `src/config/forms.ts`: Configures FormStack with Prisma and a toggle plugin.
    - `prisma/schema.prisma`: Defines `Form` and `FormSubmission` models.
 3. **Set Up Environment**:
    Create `.env` in your project root:
    ```env
    DATABASE_URL="postgresql://postgres:your-password@localhost:5432/postgres"
    ```
 4. **Generate Prisma Client**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

 ### Usage
 1. **Configure FormStack**:
    The generated `src/config/forms.ts` sets up FormStack:
    ```typescript
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
    ```
 2. **Define and Register a Form**:
    In your Next.js page (e.g., `app/page.tsx`):
    ```typescript
    import FormStack from 'formstack';
    import { z } from 'zod';
    import '../config/forms';

    export default async function Home() {
      const form = FormStack.define({
        name: 'example',
        schema: z.object({ name: z.string().min(1) }),
      });
      await FormStack.register(form);
      return <div>FormStack Initialized</div>;
    }
    ```
 3. **Run the App**:
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`.

 ## Development
 - **Build**: `npm run build`
 - **Test**: `npm test`
 - **Prisma Studio**: `npx prisma studio` to view the database.

 ## Contributing
 Contributions are welcome! See [LICENSE](LICENSE) (MIT).