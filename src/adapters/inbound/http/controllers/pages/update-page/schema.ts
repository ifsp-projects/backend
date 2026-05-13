import { z } from 'zod'

export const updatePageParamsSchema = z.object({
  id: z.string()
})

export const updatePageBodySchema = z.object({
  sections: z.any().optional(),
  order: z.string().array().optional(),
  main_color: z.string().optional()
})
