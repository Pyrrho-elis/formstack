import { z } from 'zod';
//  import { PrismaClient } from '@prisma/client';
import { PrismaClient } from './generated/prisma';

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
  type: 'prisma';
  client: PrismaClient;
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
  private static prisma: PrismaClient | null = null;
  private static forms: Map<string, FormConfig> = new Map();

  static configure(config: Config) {
    if (this.config) throw new Error('FormStack already configured');
    this.config = config;
    if (config.storage.type === 'prisma') {
      this.prisma = config.storage.client;
    }
  }

  static define(config: FormConfig) {
    if (!config.name || typeof config.name !== 'string') {
      throw new Error('Form name must be a non-empty string');
    }
    if (!(config.schema instanceof z.ZodObject)) {
      throw new Error(`Schema for ${config.name} must be a Zod object`);
    }
    return config;
  }

  static register(form: FormConfig) {
    const instance = new FormStack();
    if (FormStack.forms.has(form.name)) {
      throw new Error(`Form '${form.name}' already registered`);
    }
    FormStack.forms.set(form.name, form);
    if (FormStack.prisma) {
      FormStack.prisma.form.upsert({
        where: { name: form.name },
        update: { schema: JSON.stringify(form.schema.shape), enabled: true },
        create: { name: form.name, schema: JSON.stringify(form.schema.shape), enabled: true },
      });
    }
    return form;
  }
}

export default FormStack;