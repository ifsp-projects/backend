import { OrganizationDoesNotExistError } from '@/core/domain/exceptions/organizations'
import { BaseAuth } from '../base'
import { SocialLoginUseCasePayload, SocialLoginUseCaseReturn } from './types'
import { InvalidSocialAccountError } from '@/core/domain/exceptions/auth'
import { env } from '@/config/env'
import { OAuth2Client } from 'google-auth-library'
import { OrganizationsRepository } from '@/core/ports/repositories/prisma/organization-repository'

export class SocialLoginUseCase extends BaseAuth {
  private googleClient: OAuth2Client

  constructor(
    protected readonly organizationRepository: OrganizationsRepository
  ) {
    super(organizationRepository)
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
