import {z} from 'zod'

export const deleteAddressParamsSchema = z.object({
  id: z.string().uuid()
})
