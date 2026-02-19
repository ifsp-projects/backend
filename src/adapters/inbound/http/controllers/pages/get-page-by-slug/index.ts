import { PagesRepository } from '@/adapters/outbound/prisma/repositories/pages-repository'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { getPageBySlugParamsSchema } from './schema'
import { GetPageBySlugUseCase } from '@/core/use-cases/pages/get-page-by-slug'

export class GetPageBySlugController {
  private pagesRepository: PagesRepository
  private useCase: GetPageBySlugUseCase

  constructor() {
    this.pagesRepository = new PagesRepository()
    this.useCase = new GetPageBySlugUseCase(this.pagesRepository)
  }

  @Route('GET', '/pages/slug/:slug')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slug } = getPageBySlugParamsSchema.parse(request.params)

    const response = await this.useCase.execute(slug)

    return reply.status(200).send(response)
  }
}

export const getPageBySlugController = new GetPageBySlugController()
