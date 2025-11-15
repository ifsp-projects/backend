import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createOrganizationProfileBodySchema } from './schemas'
import { OrganizationsProfilesRepository } from '@/core/ports/repositories/prisma/organization-profiles-repository'
import { CreateOrganizationProfileUseCase } from '@/core/use-cases/organizations-profiles/create-organization-profile'

export class CreateOrganizationProfileController {
  private organizationProfileRepository: OrganizationsProfilesRepository
  private useCase: CreateOrganizationProfileUseCase

  constructor() {
    this.organizationProfileRepository = new OrganizationsProfilesRepository()
    this.useCase = new CreateOrganizationProfileUseCase(
      this.organizationProfileRepository
    )
  }

  @Route('POST', '/organizations-profiles', {
    middlewares: [verifyJWT]
  })
  protected async execute(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const payload = createOrganizationProfileBodySchema.parse(request.body)

    const response = await this.useCase.execute(payload)

    return reply.status(201).send(response)
  }
}

export const createOrganizationProfileController =
  new CreateOrganizationProfileController()
