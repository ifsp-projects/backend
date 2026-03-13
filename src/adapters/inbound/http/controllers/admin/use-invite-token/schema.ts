import { z } from 'zod'

export const useInviteTokenBodySchema = z.object({
  token: z.string().uuid()
})
