import type { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import { CampaignDoesNotExistError } from '@/core/domain/exceptions/campaigns'

import type { DeleteCampaignUseCaseReturn } from './types'

export class DeleteCampaignUseCase {
  constructor(protected readonly campaignsRepository: CampaignsRepository) {}

  execute = async (id: string): Promise<DeleteCampaignUseCaseReturn> => {
    const campaignExists = await this.campaignsRepository.getCampaignById(id)

    if (!campaignExists) {
      throw new CampaignDoesNotExistError()
    }

    const deletedCampaign = await this.campaignsRepository.deleteCampaign(id)

    if (!deletedCampaign) {
      throw new CampaignDoesNotExistError()
    }

    return {
      campaign: deletedCampaign
    }
  }
}
