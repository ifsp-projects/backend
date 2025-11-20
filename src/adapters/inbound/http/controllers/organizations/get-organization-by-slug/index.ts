import { OrganizationsRepository } from '@/core/ports/repositories/prisma/organization-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getOrganizationBySlugParamsSchema } from './schema'
import { GetOrganizationBySlugUseCase } from '@/core/use-cases/organizations/get-organization-by-slug'

export class GetOrganizationBySlugController {
  private organizationRepository = new OrganizationsRepository()
  private useCase: GetOrganizationBySlugUseCase

  constructor() {
    this.organizationRepository = new OrganizationsRepository()
    this.useCase = new GetOrganizationBySlugUseCase(this.organizationRepository)
  }

  @Route('GET', '/organizations/slug/:slug')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slug } = getOrganizationBySlugParamsSchema.parse(request.params)

    const response = await this.useCase.execute(slug)

    return reply.status(200).send(response)
  }
}

export const getOrganizationBySlugController = new GetOrganizationBySlugController()
