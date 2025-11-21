import { z } from 'zod'

export const getPageBySlugParamsSchema = z.object({
  slug: z.string().nonempty()
})
