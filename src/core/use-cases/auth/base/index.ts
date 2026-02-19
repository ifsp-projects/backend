import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'

import { FastifyReply } from 'fastify'

export type SignJwtTokensPayload = {
  id: string
}

export abstract class BaseAuth {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository
  ) {}

  protected async signJwtTokens(
    reply: FastifyReply,
    { id }: SignJwtTokensPayload
  ) {
    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: id,
          expiresIn: '40m'
        }
      }
    )

    const refreshToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: id,
          expiresIn: '7d'
        }
      }
    )

    return { token, refreshToken }
  }

  protected async getOrCreateUser(email: string) {
    let organization =
      await this.organizationsRepository.getOrganizationByEmail(email)

    if (!organization) {
      const organization =
        await this.organizationsRepository.createOrganization({ email })
    }

    if (organization) return organization
  }
}
