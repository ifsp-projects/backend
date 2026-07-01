import type { FastifyReply, FastifyRequest } from 'fastify'

import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { GetOrganizationProfileBySlugUseCase } from '@/core/use-cases/organizations-profiles/get-organization-profile-by-slug'

import { Trace } from '../../../decorators/trace-decorator'
import { getOrganizationByEmailParamsSchema } from './schema'

export class GetOrganizationProfileByEmailController {
  private organizationProfileRepository: OrganizationsProfilesRepository
  private useCase: GetOrganizationProfileBySlugUseCase

  constructor() {
    this.organizationProfileRepository = new OrganizationsProfilesRepository()
    this.useCase = new GetOrganizationProfileBySlugUseCase(
      this.organizationProfileRepository
    )
  }

  @Route('GET', '/organizations-profiles/email/:email')
  @Trace('organizations-profiles.get_organization_profile_by_email')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { email } = getOrganizationByEmailParamsSchema.parse(request.params)

    const response = await this.useCase.execute(email)

    return reply.status(200).send(response)
  }
}

export const getOrganizationProfileByEmailController =
  new GetOrganizationProfileByEmailController()
