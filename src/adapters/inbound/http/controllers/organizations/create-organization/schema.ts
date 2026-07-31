import { z } from 'zod'

import { AccountStatusEnum, UserRoleEnum } from '@prisma-generated'

export const createOrganizationBodySchema = z.object({
  email: z.string().email().nonempty(),
  role: z.enum(UserRoleEnum).default(UserRoleEnum.member),
  account_status: z.enum(AccountStatusEnum).default(AccountStatusEnum.inactive)
})
