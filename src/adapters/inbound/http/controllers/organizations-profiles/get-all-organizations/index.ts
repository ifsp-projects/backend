import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetAllOrganizationsProfilesUseCase } from '@/core/use-cases/organizations-profiles/get-all-organizations-profiles'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'

export class GetAllOrganizationsProfilesController {
  private organizationProfileRepository: OrganizationsProfilesRepository
  private useCase: GetAllOrganizationsProfilesUseCase

  constructor() {
    this.organizationProfileRepository = new OrganizationsProfilesRepository()
    this.useCase = new GetAllOrganizationsProfilesUseCase(
      this.organizationProfileRepository
    )
  }

  @Route('GET', '/organizations-profiles')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const response = await this.useCase.execute()

    return reply.status(200).send(response)
  }
}

export const getAllOrganizationsProfilesController =
  new GetAllOrganizationsProfilesController()
