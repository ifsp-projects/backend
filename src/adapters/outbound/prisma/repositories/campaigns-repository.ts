import { randomUUID } from 'crypto'

import type { CampaignInterface } from '@/core/domain/ports/interfaces/campaigns-interface'
import type { Campaign, Prisma } from '@prisma-generated'

import { prisma } from '../prisma'

export class CampaignsRepository implements CampaignInterface {
  createCampaign = async ({
    id = randomUUID(),
    ...payload
  }: Prisma.CampaignUncheckedCreateInput): Promise<Campaign> => {
    return await prisma.campaign.create({
      data: {
        id,
        ...payload
      }
    })
  }

  deleteCampaign = async (id: string): Promise<Campaign | null> => {
    return await prisma.campaign.delete({
      where: {
        id
      }
    })
  }

  getAllCampaigns = async (): Promise<Campaign[] | null> => {
    return await prisma.campaign.findMany()
  }

  getCampaignById = async (id: string): Promise<Campaign | null> => {
    return await prisma.campaign.findFirst({
      where: {
        id
      }
    })
  }

  updateCampaign = async (
    id: string,
    payload: Prisma.CampaignUncheckedUpdateInput
  ): Promise<Campaign | null> => {
    return await prisma.campaign.update({
      where: {
        id
      },
      data: {
        ...payload
      }
    })
  }
}
