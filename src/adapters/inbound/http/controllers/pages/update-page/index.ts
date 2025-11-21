import { PagesRepository } from '@/core/ports/repositories/prisma/pages-repository'
import { UpdatePageUseCase } from '@/core/use-cases/pages/update-page'
import { verifyJWT } from '@/adapters/inbound/http/middlewares/verify-jwt'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { updatePageBodySchema, updatePageParamsSchema } from './schema'

export class UpdatePageController {
  private pagesRepository: PagesRepository
  private useCase: UpdatePageUseCase

  constructor() {
    this.pagesRepository = new PagesRepository()
    this.useCase = new UpdatePageUseCase(this.pagesRepository)
  }

  @Route('PATCH', '/pages/:id', {
    middlewares: [verifyJWT]
  })
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = updatePageParamsSchema.parse(request.params)

    const payload = updatePageBodySchema.parse(request.body)

    const response = await this.useCase.execute({ ...payload, id })

    return reply.status(200).send(response)
  }
}

export const updatePageController = new UpdatePageController()
