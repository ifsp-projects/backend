import { z } from 'zod'

export const getAllOrganizationsQuerySchema = z.object({
    name: z.string().optional()
})
