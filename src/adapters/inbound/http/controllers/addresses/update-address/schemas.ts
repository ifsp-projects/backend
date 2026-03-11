import {z} from 'zod'

export const updateAddressParamsSchema = z.object({
  id: z.string()
})

export const updateAddressBodySchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional()
})
