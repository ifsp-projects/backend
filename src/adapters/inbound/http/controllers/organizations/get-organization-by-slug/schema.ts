import { z } from 'zod'

export const getOrganizationBySlugParamsSchema = z.object({
  slug: z.string().uuid()
})
