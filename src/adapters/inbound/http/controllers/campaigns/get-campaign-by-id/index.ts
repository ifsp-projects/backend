import type { FastifyReply, FastifyRequest } from 'fastify'

import { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import { GetCampaignByIdUseCase } from '@/core/use-cases/campaigns/get-campaign-by-id'

import { Route } from '../../../decorators/route-decorator'
import { Trace } from '../../../decorators/trace-decorator'
import { getCampaignByIdParamsSchema } from './schema'

export class GetCampaignByIdController {
  private campaignsRepository: CampaignsRepository
  private useCase: GetCampaignByIdUseCase

  constructor() {
    this.campaignsRepository = new CampaignsRepository()
    this.useCase = new GetCampaignByIdUseCase(this.campaignsRepository)
  }

  @Route('GET', '/campaigns/:id')
  @Trace('campaigns.get_campaign_by_id')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = getCampaignByIdParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(200).send(response)
  }
}

export const getCampaignByIdController = new GetCampaignByIdController()
