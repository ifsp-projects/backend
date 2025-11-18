import {z} from 'zod'

export const updateAddressParamsSchema = z.object({
  id: z.string()
})

export const updateAddressBodySchema = z.object({
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable()
})
