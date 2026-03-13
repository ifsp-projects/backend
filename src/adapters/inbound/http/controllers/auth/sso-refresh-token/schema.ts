import { z } from 'zod'

export const refreshSchema = z.object({
  refresh_token: z.string().min(1)
})
