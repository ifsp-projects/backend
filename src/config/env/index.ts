import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  ENV: z.enum(['dev', 'prod']).default('dev'),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  DEBUG: z.string(),
  WEBPAGE_BASE_URL: z.string(),
  RESEND_API_KEY: z.string(),
  APP_URL: z.string(),
  EMAIL_FROM: z.string(),
  OPENAI_API_KEY: z.string(),
  OPENAI_ORGANIZATION_ID: z.string(),
  OPENAI_PROJECT_ID: z.string()
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid Environment Variables', parsed.error.format())

  throw new Error('Invalid Environment Variables.')
}

export const env = {
  ...parsed.data,
  IS_DEVELOP_MODE: parsed.data.ENV === 'dev'
}
