import type { FastifyReply, FastifyRequest } from 'fastify'

import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { GetOrganizationByIdUseCase } from '@/core/use-cases/organizations/get-organization-by-id'

import { Trace } from '../../../decorators/trace-decorator'
import { getOrganizationByIdParamsSchema } from './schema'

export class GetOrganizationByIdController {
  private organizationRepository: OrganizationsRepository
  private useCase: GetOrganizationByIdUseCase

  constructor() {
    this.organizationRepository = new OrganizationsRepository()
    this.useCase = new GetOrganizationByIdUseCase(this.organizationRepository)
  }

  @Route('GET', '/organizations/:id')
  @Trace('organizations.get_organization_by_id')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = getOrganizationByIdParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(200).send(response)
  }
}

export const getOrganizationByIdController = new GetOrganizationByIdController()
