import '@fastify/jwt'
import { UserRoleEnum } from '@prisma/client'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    profile: {
      role?: UserRoleEnum | null
      companyId?: string | null
    }
    user: {
      sub: string
      email?: string | null
    }
  }
}
