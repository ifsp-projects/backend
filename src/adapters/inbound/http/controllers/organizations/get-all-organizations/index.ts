import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetAllOrganizationsUseCase } from '@/core/use-cases/organizations/get-all-organizations'

export class GetAllOrganizationsController {
  private organizationRepository: OrganizationsRepository
  private useCase: GetAllOrganizationsUseCase

  constructor() {
    this.organizationRepository = new OrganizationsRepository()
    this.useCase = new GetAllOrganizationsUseCase(this.organizationRepository)
  }

  @Route('GET', '/organizations')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const response = await this.useCase.execute()

    return reply.status(200).send(response)
  }
}

export const getAllOrganizationsController = new GetAllOrganizationsController()
