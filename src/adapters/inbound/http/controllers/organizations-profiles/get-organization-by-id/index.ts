import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getOrganizationByIdParamsSchema } from './schema'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { GetOrganizationProfileByIdUseCase } from '@/core/use-cases/organizations-profiles/get-organization-profile-by-id'
import { Trace } from '../../../decorators/trace-decorator'

export class GetOrganizationProfileByIdController {
  private organizationProfileRepository: OrganizationsProfilesRepository
  private useCase: GetOrganizationProfileByIdUseCase

  constructor() {
    this.organizationProfileRepository = new OrganizationsProfilesRepository()
    this.useCase = new GetOrganizationProfileByIdUseCase(
      this.organizationProfileRepository
    )
  }

  @Route('GET', '/organizations-organizations-profiles/:id')
  @Trace('organizations-profiles.get_organization_profile_by_id')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = getOrganizationByIdParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(200).send(response)
  }
}

export const getOrganizationProfileByIdController =
  new GetOrganizationProfileByIdController()
