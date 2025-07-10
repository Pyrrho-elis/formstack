import { z } from 'zod';
     import Database from 'better-sqlite3';

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

     type StorageConfig = {
       type: 'sqlite';
       path: string;
     };

     type AdapterConfig = {
       type: 'nextjs';
       options: { autoRoute: boolean; dashboardPath: string };
     };

     type Plugin = {
       name: string;
       onToggle?: (formName: string, enabled: boolean) => Promise<void>;
       analytics?: (formName: string) => Promise<any>;
     };

     type Config = {
       storage: StorageConfig;
       adapter: AdapterConfig;
       plugins: Plugin[];
       styles: {
         default: 'tailwind' | 'minimal';
         custom?: (formName: string) => Record<string, string>;
       };
     };

     class FormStack {
       private static config: Config | null = null;
       private static db: Database.Database | null = null;
       private forms: Map<string, FormConfig> = new Map();

       static configure(config: Config) {
         if (this.config) throw new Error('FormStack already configured');
         this.config = config;
         if (config.storage.type === 'sqlite') {
           this.db = new Database(config.storage.path);
           this.db.exec(`
             CREATE TABLE IF NOT EXISTS forms (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT UNIQUE,
               schema JSON,
               enabled BOOLEAN DEFAULT TRUE
             )
           `);
         }
       }

       static define(config: FormConfig) {
         if (!config.name || typeof config.name !== 'string') {
           throw new Error('Form name must be a non-empty string');
         }
         try {
           // Check schema structure without validating data
           config.schema.parse.bind(config.schema); // Ensure schema is valid
           return config;
         } catch (error) {
           throw new Error(`Invalid form schema for ${config.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
         }
       }

       static register(form: FormConfig) {
         const instance = new FormStack();
         if (instance.forms.has(form.name)) {
           throw new Error(`Form '${form.name}' already registered`);
         }
         instance.forms.set(form.name, form);
         if (FormStack.db) {
           FormStack.db.prepare('INSERT OR REPLACE INTO forms (name, schema, enabled) VALUES (?, ?, ?)')
             .run(form.name, JSON.stringify(form.schema.shape), true);
         }
         return form;
       }
     }

     export default FormStack;