import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import { deleteOrganizationProfileParamsSchema } from './schema'
import { OrganizationsProfilesRepository } from '@/core/ports/repositories/prisma/organization-profiles-repository'
import { DeleteOrganizationProfileUseCase } from '@/core/use-cases/organizations-profiles/delete-organization-profile'

export class DeleteOrganizationprofileController {
  private organizationProfileRepository = new OrganizationsProfilesRepository()
  private useCase: DeleteOrganizationProfileUseCase

  constructor() {
    this.organizationProfileRepository = new OrganizationsProfilesRepository()
    this.useCase = new DeleteOrganizationProfileUseCase(
      this.organizationProfileRepository
    )
  }

  @Route('DELETE', '/organizations-profiles/:id', {
    middlewares: [verifyJWT]
  })
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = deleteOrganizationProfileParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(204).send(response)
  }
}

export const deleteOrganizationprofileController =
  new DeleteOrganizationprofileController()
