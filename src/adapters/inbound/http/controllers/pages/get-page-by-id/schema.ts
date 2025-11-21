import { z } from 'zod'

export const getPageByIdParamsSchema = z.object({
  id: z.string().nonempty()
})
