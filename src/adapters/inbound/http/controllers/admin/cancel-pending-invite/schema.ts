import { z } from 'zod'

export const cancelPendingInviteParamsSchema = z.object({
  id: z.string().uuid()
})
