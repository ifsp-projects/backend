import type { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import { CampaignDoesNotExistError } from '@/core/domain/exceptions/campaigns'

import type {
  UpdateCampaignPayload,
  UpdateCampaignUseCaseReturn
} from './types'

export class UpdateCampaignUseCase {
  constructor(protected readonly campaignsRepository: CampaignsRepository) {}

  execute = async (
    payload: UpdateCampaignPayload
  ): Promise<UpdateCampaignUseCaseReturn> => {
    const { id } = payload

    const campaignExists = await this.campaignsRepository.getCampaignById(id)

    if (!campaignExists) {
      throw new CampaignDoesNotExistError()
    }

    const updatedCampaign = await this.campaignsRepository.updateCampaign(
      id,
      payload
    )

    return {
      campaign: updatedCampaign
    }
  }
}
