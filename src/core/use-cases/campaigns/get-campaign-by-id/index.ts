import type { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import { CampaignDoesNotExistError } from '@/core/domain/exceptions/campaigns'

import type { GetCampaignByIdUseCaseReturn } from './types'

export class GetCampaignByIdUseCase {
  constructor(protected readonly campaignsRepository: CampaignsRepository) {}

  execute = async (id: string): Promise<GetCampaignByIdUseCaseReturn> => {
    const campaignExists = await this.campaignsRepository.getCampaignById(id)

    if (!campaignExists) {
      throw new CampaignDoesNotExistError()
    }

    return {
      campaign: campaignExists
    }
  }
}
