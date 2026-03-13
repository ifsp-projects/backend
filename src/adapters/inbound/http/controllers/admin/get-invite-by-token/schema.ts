import { z } from 'zod'

export const getInviteByTokenParamsSchema = z.object({
  token: z.string().uuid()
})
