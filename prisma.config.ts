import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema',
  migrations: {
    path: './prisma/schema/migrations'
    // seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env('DATABASE_URL'),
  }
}) 
