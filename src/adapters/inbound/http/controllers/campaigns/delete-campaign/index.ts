import type { FastifyReply, FastifyRequest } from 'fastify'

import { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import { DeleteCampaignUseCase } from '@/core/use-cases/campaigns/delete-campaign'

import { Route } from '../../../decorators/route-decorator'
import { Trace } from '../../../decorators/trace-decorator'
import { verifyJWT } from '../../../middlewares/verify-jwt'
import { deleteCampaignParamsSchema } from './schema'

export class DeleteCampaignController {
  private campaignsRepository: CampaignsRepository
  private useCase: DeleteCampaignUseCase

  constructor() {
    this.campaignsRepository = new CampaignsRepository()
    this.useCase = new DeleteCampaignUseCase(this.campaignsRepository)
  }

  @Route('DELETE', '/campaigns/:id', {
    middlewares: [verifyJWT]
  })
  @Trace('campaigns.delete_campaign')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = deleteCampaignParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(204).send(response)
  }
}

export const deleteCampaignController = new DeleteCampaignController()
