import { OrganizationsRepository } from '@/adapters/outbound/prisma/repositories/organization-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import { DeleteOrganizationUseCase } from '@/core/use-cases/organizations/delete-organization'
import { deleteOrganizationParamsSchema } from './schema'

export class DeleteOrganizationController {
  private organizationRepository: OrganizationsRepository
  private useCase: DeleteOrganizationUseCase

  constructor() {
    this.organizationRepository = new OrganizationsRepository()
    this.useCase = new DeleteOrganizationUseCase(this.organizationRepository)
  }

  @Route('DELETE', '/organizations/:id', {
    middlewares: [verifyJWT]
  })
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = deleteOrganizationParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(204).send(response)
  }
}

export const deleteOrganizationController = new DeleteOrganizationController()
