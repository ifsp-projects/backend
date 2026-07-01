import { z } from 'zod'

export const deleteCampaignParamsSchema = z.object({
  id: z.string().uuid()
})
