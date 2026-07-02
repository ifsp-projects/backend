import type { FastifyReply, FastifyRequest } from 'fastify'

import { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import { UpdateCampaignUseCase } from '@/core/use-cases/campaigns/update-campaign'

import { Route } from '../../../decorators/route-decorator'
import { Trace } from '../../../decorators/trace-decorator'
import { verifyJWT } from '../../../middlewares/verify-jwt'
import { updateCampaignBodySchema, updateCampaignParamsSchema } from './schema'

export class UpdateCampaignController {
  private campaignsRepository: CampaignsRepository
  private useCase: UpdateCampaignUseCase

  constructor() {
    this.campaignsRepository = new CampaignsRepository()
    this.useCase = new UpdateCampaignUseCase(this.campaignsRepository)
  }

  @Route('PATCH', '/campaigns/:id', {
    middlewares: [verifyJWT]
  })
  @Trace('campaigns.update_campaign')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = updateCampaignParamsSchema.parse(request.params)

    const payload = updateCampaignBodySchema.parse(request.body)

    const response = await this.useCase.execute({ ...payload, id })

    return reply.status(200).send(response)
  }
}

export const updateCampaignController = new UpdateCampaignController()
