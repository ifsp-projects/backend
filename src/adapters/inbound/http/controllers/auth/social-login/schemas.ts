import { z } from 'zod'

import { SUPPORTED_SOCIAL_AUTH_TYPES } from '@/shared/constants/supported-social-auth-types'

export const socialLoginBodySchema = z.object({
  email: z.string().email(),
  socialToken: z.string(),
  socialType: z.enum(SUPPORTED_SOCIAL_AUTH_TYPES)
})
