import { z } from 'zod'

export const createOrganizationBodySchema = z.object({
  email: z.string().email(),
  password: z.string()
})
