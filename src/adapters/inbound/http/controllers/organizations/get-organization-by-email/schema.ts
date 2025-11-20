import { z } from 'zod'

export const getOrganizationByEmailParamsSchema = z.object({
  email: z.string().email()
})
