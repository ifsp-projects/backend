import type { Campaign } from '@prisma-generated'

export interface GetAllCampaignsUseCaseReturn {
  campaigns: Campaign[]
}
