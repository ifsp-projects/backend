import {z} from 'zod'

export const getAddressByIdParamsSchema = z.object({
  id: z.string().email()
})
