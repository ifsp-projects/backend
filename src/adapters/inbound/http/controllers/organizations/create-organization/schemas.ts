import { z } from 'zod'

export const createOrganizationBodySchema = z.object({
  id: z.string().optional(),
  email: z.string().email()
})
