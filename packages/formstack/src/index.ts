import { z } from 'zod';

     type FormOptions = {
       style?: 'tailwind' | 'minimal' | 'custom';
       submitButton?: { text: string; className?: string };
       onSubmit?: (data: any) => Promise<void>;
     };

     type FormConfig = {
       name: string;
       schema: z.ZodObject<any>;
       options?: FormOptions;
     };

     class FormStack {
       private forms: Map<string, FormConfig> = new Map();

       static define(config: FormConfig) {
         try {
           config.schema.parse({}); // Validate schema structure
           return config;
         } catch (error) {
           throw new Error(`Invalid form schema for ${config.name}: ${error.message}`);
         }
       }

       static register(form: FormConfig) {
         const instance = new FormStack();
         if (instance.forms.has(form.name)) {
           throw new Error(`Form '${form.name}' already registered`);
         }
         instance.forms.set(form.name, form);
         // Save to storage (implemented in Step 3)
         return form;
       }
     }

     export default FormStack;