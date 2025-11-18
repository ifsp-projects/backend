import { z } from 'zod'

export const createAddressBodySchema = z.object({
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  organization_profile_id: z.string().nonempty('Esse campo é obrigatório')
})
