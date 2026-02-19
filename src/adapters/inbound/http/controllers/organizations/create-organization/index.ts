import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { CreateOrganizationUseCase } from '@/core/use-cases/organizations/create-organization'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createOrganizationBodySchema } from './schemas'

export class CreateOrganizationController {
  private organizationRepository: OrganizationsRepository
  private useCase: CreateOrganizationUseCase

  constructor() {
    this.organizationRepository = new OrganizationsRepository()
    this.useCase = new CreateOrganizationUseCase(this.organizationRepository)
  }

  @Route('POST', '/organizations', {
    middlewares: [verifyJWT]
  })
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = createOrganizationBodySchema.parse(request.body)

    const response = await this.useCase.execute(payload)

    return reply.status(201).send(response)
  }
}

export const createOrganizationController = new CreateOrganizationController()
