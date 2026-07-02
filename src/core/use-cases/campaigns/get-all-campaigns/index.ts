import type { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import { DoesNotExistsAnyCampaignsError } from '@/core/domain/exceptions/campaigns'

import type { GetAllCampaignsUseCaseReturn } from './types'

export class GetAllCampaignsUseCase {
  constructor(protected readonly campaignsRepository: CampaignsRepository) {}

  execute = async (): Promise<GetAllCampaignsUseCaseReturn> => {
    const campaigns = await this.campaignsRepository.getAllCampaigns()

    if (!campaigns) {
      throw new DoesNotExistsAnyCampaignsError()
    }

    return {
      campaigns
    }
  }
}
