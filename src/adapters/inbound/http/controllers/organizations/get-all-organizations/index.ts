import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetAllOrganizationsUseCase } from '@/core/use-cases/organizations/get-all-organizations'
import { getAllOrganizationsQuerySchema } from './schema'
import { Trace } from '../../../decorators/trace-decorator'

export class GetAllOrganizationsController {
  private organizationRepository: OrganizationsRepository
  private useCase: GetAllOrganizationsUseCase

  constructor() {
    this.organizationRepository = new OrganizationsRepository()
    this.useCase = new GetAllOrganizationsUseCase(this.organizationRepository)
  }

  @Route('GET', '/organizations')
  @Trace('organizations.get_all_organizations')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { name, ong_type } = getAllOrganizationsQuerySchema.parse(request.query)

    const response = await this.useCase.execute({ name, ong_type })

    return reply.status(200).send(response)
  }
}

export const getAllOrganizationsController = new GetAllOrganizationsController()
