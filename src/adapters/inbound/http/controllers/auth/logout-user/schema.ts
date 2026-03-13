import { z } from 'zod'

export const logoutSchema = z.object({
  session_id: z.string().uuid()
})
