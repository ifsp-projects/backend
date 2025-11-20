import { z } from 'zod'

export const updateOrganizationParamsSchema = z.object({
  id: z.string()
})

export const updateOrganizationBodySchema = z.object({
  email: z.string().email().optional()
})
