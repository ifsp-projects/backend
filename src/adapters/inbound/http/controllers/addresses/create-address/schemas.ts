import { z } from 'zod'

export const createAddressBodySchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  organization_profile_id: z.string().nonempty('Esse campo é obrigatório'),
  is_primary: z.boolean().default(false)
})
