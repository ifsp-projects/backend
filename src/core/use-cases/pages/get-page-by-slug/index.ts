import { PagesRepository } from '@/core/ports/repositories/prisma/pages-repository'

import { GetPageBySlugUseCaseReturn } from './types'
import { PageDoesNotExistError } from '@/core/domain/exceptions/pages'

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
