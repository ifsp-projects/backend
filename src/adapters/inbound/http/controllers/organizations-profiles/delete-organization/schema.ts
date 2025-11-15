import z from 'zod'

export const deleteOrganizationProfileParamsSchema = z.object({
  id: z.string().uuid()
})
