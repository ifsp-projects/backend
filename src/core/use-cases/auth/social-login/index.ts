import { OAuth2Client } from 'google-auth-library'

import type { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { env } from '@/config/env'
import { InvalidSocialAccountError } from '@/core/domain/exceptions/auth'
import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import { JwtService } from '@/shared/infra/auth/jwt'

import { BaseAuth } from '../base'
import type {
  SocialLoginUseCasePayload,
  SocialLoginUseCaseReturn
} from './types'

export class SocialLoginUseCase extends BaseAuth {
  private googleClient: OAuth2Client

  constructor(
    protected readonly organizationRepository: OrganizationsRepository
  ) {
    const jwtService = new JwtService(env.JWT_SECRET)

    super(organizationRepository, jwtService)
    this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)
  }

  validateGoogleAccount = async (socialToken: string) => {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: socialToken,
        audience: env.GOOGLE_CLIENT_ID
      })

      const payload = ticket.getPayload()

      if (!payload) {
        throw new InvalidSocialAccountError()
      }

      return payload
    } catch (error) {
      console.error({
        validateGoogleAccount: error
      })

      throw new InvalidSocialAccountError()
    }
  }

  executeSociaLogin = async (
    payload: SocialLoginUseCasePayload
  ): Promise<SocialLoginUseCaseReturn> => {
    const { email, socialType, socialToken } = payload

    const organization = await this.getOrCreateUser(email)

    if (!organization?.id) {
      throw new OrganizationDoesNotExistError()
    }

    switch (socialType) {
      case 'google':
        await this.validateGoogleAccount(socialToken)
        break
    }

    return { organization }
  }
}
