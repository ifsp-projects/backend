import { z } from 'zod'

export const getCampaignByIdParamsSchema = z.object({
  id: z.string().uuid()
})
