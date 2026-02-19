import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getOrganizationByEmailParamsSchema } from './schema'
import { GetOrganizationByEmailUseCase } from '@/core/use-cases/organizations/get-organization-by-email'

export class GetOrganizationByEmailController {
  private organizationRepository: OrganizationsRepository
  private useCase: GetOrganizationByEmailUseCase

  constructor() {
    this.organizationRepository = new OrganizationsRepository()
    this.useCase = new GetOrganizationByEmailUseCase(
      this.organizationRepository
    )
  }

  @Route('GET', '/organizations/email/:email')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { email } = getOrganizationByEmailParamsSchema.parse(request.params)

    const response = await this.useCase.execute(email)

    return reply.status(200).send(response)
  }
}

export const getOrganizationByEmailController =
  new GetOrganizationByEmailController()
