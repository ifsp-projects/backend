import type { FastifyReply, FastifyRequest } from 'fastify'

import { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import { GetAllCampaignsUseCase } from '@/core/use-cases/campaigns/get-all-campaigns'

import { Route } from '../../../decorators/route-decorator'
import { Trace } from '../../../decorators/trace-decorator'

export class GetAllCampaignsController {
  private campaignsRepository: CampaignsRepository
  private useCase: GetAllCampaignsUseCase

  constructor() {
    this.campaignsRepository = new CampaignsRepository()
    this.useCase = new GetAllCampaignsUseCase(this.campaignsRepository)
  }

  @Route('GET', '/campaigns')
  @Trace('campaigns.get_all_campaigns')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const response = await this.useCase.execute()

    return reply.status(200).send(response)
  }
}

export const getAllCampaignsController = new GetAllCampaignsController()
