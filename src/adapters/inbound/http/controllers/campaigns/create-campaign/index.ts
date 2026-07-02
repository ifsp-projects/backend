import type { FastifyReply, FastifyRequest } from 'fastify'

import { CampaignsRepository } from '@/adapters/outbound/prisma/repositories/campaigns-repository'
import { CreateCampaignUseCase } from '@/core/use-cases/campaigns/create-campaign'

import { Route } from '../../../decorators/route-decorator'
import { Trace } from '../../../decorators/trace-decorator'
import { verifyJWT } from '../../../middlewares/verify-jwt'
import { createCampaignProfileBodySchema } from './schema'

export class CreateCampaignController {
  private campaignsRepository: CampaignsRepository
  private useCase: CreateCampaignUseCase

  constructor() {
    this.campaignsRepository = new CampaignsRepository()
    this.useCase = new CreateCampaignUseCase(this.campaignsRepository)
  }

  @Route('POST', '/campaigns', {
    middlewares: [verifyJWT]
  })
  @Trace('campaigns.create_campaign')
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = createCampaignProfileBodySchema.parse(request.body)

    const response = await this.useCase.execute(payload)

    return reply.status(201).send(response)
  }
}

export const createCampaignController = new CreateCampaignController()
