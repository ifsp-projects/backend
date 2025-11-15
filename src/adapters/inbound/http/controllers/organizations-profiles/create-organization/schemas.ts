import z from 'zod'

export const createOrganizationProfileBodySchema = z.object({
  id: z.string().optional(),
  ong_id: z.string().nonempty(),
  name: z.string().nonempty(),
  slug: z.string().nonempty(),
  logo: z.string().nonempty(),
  phone: z.string().nonempty()
})
