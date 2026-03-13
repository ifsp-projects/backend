import { z } from 'zod'

export const regenerateTokenAndResendParamsSchema = z.object({
  id: z.string().uuid()
})
