import type { PagesRepository } from '@/adapters/outbound/prisma/repositories/pages-repository'
import { PageDoesNotExistError } from '@/core/domain/exceptions/pages'

import type { GetPageBySlugUseCaseReturn } from './types'

export class GetPageBySlugUseCase {
  constructor(protected readonly pagesRepository: PagesRepository) {}

  execute = async (slug: string): Promise<GetPageBySlugUseCaseReturn> => {
    const page = await this.pagesRepository.getPageBySlug(slug)

    if (!page) {
      throw new PageDoesNotExistError()
    }

    return {
      page
    }
  }
}
