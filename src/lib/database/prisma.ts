import { env } from '@/utils/env'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  log: env.IS_DEVELOP_MODE ? ['error', 'warn'] : []
})
