import { OrganizationsRepository } from '@/core/ports/repositories/prisma/organization-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { UpdateOrganizationUseCase } from '@/core/use-cases/organizations/update-organization'
import {
  updateOrganizationBodySchema,
  updateOrganizationParamsSchema
} from './schema'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import { OrganizationsProfilesRepository } from '@/core/ports/repositories/prisma/organization-profiles-repository'
import { UpdateOrganizationProfileUseCase } from '@/core/use-cases/organizations-profiles/update-organization-profile'

export class UpdateOrganizationProfileController {
  private organizationProfileRepository: OrganizationsProfilesRepository
  private useCase: UpdateOrganizationProfileUseCase

  constructor() {
    this.organizationProfileRepository = new OrganizationsProfilesRepository()
    this.useCase = new UpdateOrganizationProfileUseCase(
      this.organizationProfileRepository
    )
  }

  @Route('PATCH', '/organizations-organizations-profiles/:id', {
    middlewares: [verifyJWT]
  })
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = updateOrganizationParamsSchema.parse(request.params)

    const payload = updateOrganizationBodySchema.parse(request.body)

    const response = await this.useCase.execute({ ...payload, id })

    return reply.status(200).send(response)
  }
}

export const updateOrganizationProfileController =
  new UpdateOrganizationProfileController()
