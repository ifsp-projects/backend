import { z } from 'zod'

export const createAndSendInviteBodySchema = z.object({
  email: z.string().email(),
  organization_id: z.string().uuid()
})
