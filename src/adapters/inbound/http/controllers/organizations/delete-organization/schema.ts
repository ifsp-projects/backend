import { z } from 'zod'

export const deleteOrganizationParamsSchema = z.object({
  id: z.string().uuid()
})
