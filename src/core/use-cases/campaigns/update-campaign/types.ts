import type { Campaign, Prisma } from '@prisma-generated'

export interface UpdateCampaignUseCaseReturn {
  campaign: Campaign | null
}

export interface UpdateCampaignPayload extends Omit<
  Prisma.CampaignUncheckedUpdateInput,
  'id'
> {
  id: string
}
