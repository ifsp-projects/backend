import { SUPPORTED_SOCIAL_AUTH_TYPES } from '@/shared/constants/supported-social-auth-types'
import { Organization } from '@prisma/client'

export interface SocialLoginUseCasePayload {
  email: string
  socialToken: string
  socialType: (typeof SUPPORTED_SOCIAL_AUTH_TYPES)[number]
}

export interface SocialLoginUseCaseReturn {
  organization: Organization
}
