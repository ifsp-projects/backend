import type { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import type { Prisma } from '@prisma-generated'

import type { CreateCampaignUseCaseReturn } from './types'

export class CreateCampaignUseCase {
  constructor(protected readonly campaignRepository: CampaignsRepository) {}

  execute = async (
    payload: Prisma.CampaignUncheckedCreateInput
  ): Promise<CreateCampaignUseCaseReturn> => {
    const createdCampaign = await this.campaignRepository.createCampaign({
      ...payload
    })

    return {
      campaign: createdCampaign
    }
  }
}
