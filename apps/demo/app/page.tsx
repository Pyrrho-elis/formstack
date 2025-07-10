import FormStack from 'formstack';
import { z } from 'zod';
import '../src/config/forms';

export default async function Home() {
  const form = FormStack.define({
    name: 'example',
    schema: z.object({ name: z.string().min(1) }),
  });
  await FormStack.register(form);
  return <div>FormStack Initialized</div>;
}