import { OrganizationsRepository } from '@/core/ports/repositories/prisma/organization-repository'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { UpdateOrganizationUseCase } from '@/core/use-cases/organizations/update-organization'
import {
  updateOrganizationBodySchema,
  updateOrganizationParamsSchema
} from './schema'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'

export class UpdateOrganizationController {
  private organizationRepository = new OrganizationsRepository()
  private useCase: UpdateOrganizationUseCase

  constructor() {
    this.organizationRepository = new OrganizationsRepository()
    this.useCase = new UpdateOrganizationUseCase(this.organizationRepository)
  }

  @Route('PATCH', '/organizations/:id', {
    middlewares: [verifyJWT]
  })
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = updateOrganizationParamsSchema.parse(request.params)

    const payload = updateOrganizationBodySchema.parse(request.body)

    const response = await this.useCase.execute({ ...payload, id })

    return reply.status(200).send(response)
  }
}

export const updateOrganizationController = new UpdateOrganizationController()
