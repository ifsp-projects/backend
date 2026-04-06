import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { Duration, JwtService } from '@/shared/infra/auth/jwt'

import { FastifyReply } from 'fastify'

export type SignJwtTokensPayload = {
  id: string
  email: string
  role: string
}

export abstract class BaseAuth {
  constructor(
    protected readonly organizationsRepository: OrganizationsRepository,
    private readonly jwtService: JwtService
  ) {}

  protected async signJwtTokens(
    reply: FastifyReply,
    { id, email, role }: SignJwtTokensPayload
  ) {
    const { token: token } = this.jwtService.createToken(
      id,
      email,
      role,
      Duration.minutes(40)
    )
    const { token: refreshToken } = this.jwtService.createToken(
      id,
      email,
      role,
      Duration.days(7)
    )

    return { token, refreshToken }
  }

  protected async getOrCreateUser(email: string) {
    const organization =
      await this.organizationsRepository.getOrganizationByEmail(email)

    if (!organization) {
      return await this.organizationsRepository.createOrganization({
        email
      })
    }

    return organization
  }
}
