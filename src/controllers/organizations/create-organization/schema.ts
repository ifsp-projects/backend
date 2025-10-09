import z from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string(),
  email: z.string(),
  slug: z.string()
})