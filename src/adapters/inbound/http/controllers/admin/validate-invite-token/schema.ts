import { z } from 'zod'

export const validateInviteTokenParamsSchema = z.object({
  token: z.string().uuid()
})
