import { z } from "zod";

const serverEnvSchema = z.object({
  // Core
  NODE_ENV:         z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL:     z.string().min(1, "DATABASE_URL é obrigatório"),
  JWT_SECRET:       z.string().min(32, "JWT_SECRET deve ter no mínimo 32 caracteres"),
  JWT_EXPIRES_IN:   z.string().default("24h"),

  // Pagamentos
  MP_ACCESS_TOKEN:   z.string().min(1, "MP_ACCESS_TOKEN é obrigatório"),
  MP_WEBHOOK_SECRET: z.string().min(1, "MP_WEBHOOK_SECRET é obrigatório").optional(),

  // Email
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY é obrigatório"),
  RESEND_CMS_KEY: z.string().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID:     z.string().min(1, "GOOGLE_CLIENT_ID é obrigatório"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET é obrigatório"),

  // Upload / R2
  UPLOAD_DIR:            z.string().optional(),
  NEXT_PUBLIC_UPLOAD_URL: z.string().url().optional(),

  // Cron
  CRON_SECRET: z.string().optional(),

  // Encryption
  ENCRYPTION_KEY: z.string().optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_BASE_URL:     z.string().url().optional(),
  NEXT_PUBLIC_APP_URL:      z.string().url().optional(),
  NEXT_PUBLIC_GA_ID:        z.string().optional(),
  NEXT_PUBLIC_GTM_ID:       z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
});

function validateEnv() {
  // Client env is always safe to validate
  const clientParsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_BASE_URL:     process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_URL:      process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GA_ID:        process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_GTM_ID:       process.env.NEXT_PUBLIC_GTM_ID,
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  });

  // Server env — only validate on server side
  if (typeof window === "undefined") {
    const serverParsed = serverEnvSchema.safeParse(process.env);
    if (!serverParsed.success) {
      const errors = serverParsed.error.flatten().fieldErrors;
      const messages = Object.entries(errors)
        .map(([key, msgs]) => `  • ${key}: ${(msgs ?? []).join(", ")}`)
        .join("\n");
      throw new Error(
        `\n\n[shopmotor] Variáveis de ambiente inválidas ou ausentes:\n${messages}\n\nDefina-as no arquivo .env antes de iniciar o servidor.\n`
      );
    }
    return { ...clientParsed.data, ...serverParsed.data };
  }

  return clientParsed.data ?? {};
}

export const env = validateEnv();
