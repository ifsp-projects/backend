import type { Campaign, Prisma } from '@prisma-generated'

export interface CampaignInterface {
  createCampaign(
    payload: Prisma.CampaignUncheckedCreateInput
  ): Promise<Campaign>
  deleteCampaign(id: string): Promise<Campaign | null>
  getAllCampaigns(): Promise<Campaign[] | null>
  getCampaignById(id: string): Promise<Campaign | null>
  updateCampaign(
    id: string,
    payload: Prisma.CampaignUncheckedUpdateInput
  ): Promise<Campaign | null>
}
