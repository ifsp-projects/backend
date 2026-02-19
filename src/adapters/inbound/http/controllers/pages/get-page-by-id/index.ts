import { PagesRepository } from '@/adapters/outbound/prisma/repositories/pages-repository'
import { GetPageByIdUseCase } from '@/core/use-cases/pages/get-page-by-id'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { getPageByIdParamsSchema } from './schema'

export class GetPageByIdController {
  private pagesRepository: PagesRepository
  private useCase: GetPageByIdUseCase

  constructor() {
    this.pagesRepository = new PagesRepository()
    this.useCase = new GetPageByIdUseCase(this.pagesRepository)
  }

  @Route('GET', '/pages/:id')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = getPageByIdParamsSchema.parse(request.params)

    const response = await this.useCase.execute(id)

    return reply.status(200).send(response)
  }
}

export const getPageByIdController = new GetPageByIdController()
