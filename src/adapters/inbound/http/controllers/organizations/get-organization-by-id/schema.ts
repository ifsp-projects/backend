import z from 'zod'

export const getOrganizationByIdParamsSchema = z.object({
  id: z.string().uuid()
})
