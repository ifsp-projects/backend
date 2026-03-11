import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  updateOrganizationBodySchema,
  updateOrganizationParamsSchema
} from './schema'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { UpdateOrganizationProfileUseCase } from '@/core/use-cases/organizations-profiles/update-organization-profile'
import { PagesRepository } from '@/adapters/outbound/prisma/repositories/pages-repository'

export class UpdateOrganizationProfileController {
  private organizationProfileRepository: OrganizationsProfilesRepository
  private pagesRepository: PagesRepository
  private useCase: UpdateOrganizationProfileUseCase

  constructor() {
    this.organizationProfileRepository = new OrganizationsProfilesRepository()
    this.pagesRepository = new PagesRepository()
    this.useCase = new UpdateOrganizationProfileUseCase(
      this.organizationProfileRepository,
      this.pagesRepository
    )
  }

  @Route('PATCH', '/organizations-profiles/:id', {
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
