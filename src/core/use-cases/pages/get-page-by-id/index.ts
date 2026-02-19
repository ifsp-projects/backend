import { PagesRepository } from '@/adapters/outbound/prisma/repositories/pages-repository'

import { PageDoesNotExistError } from '@/core/domain/exceptions/pages'
import { GetPageByIdUseCaseReturn } from './types'

export class GetPageByIdUseCase {
  constructor(protected readonly pagesRepository: PagesRepository) {}

  execute = async (id: string): Promise<GetPageByIdUseCaseReturn> => {
    const page = await this.pagesRepository.getPageById(id)

    if (!page) {
      throw new PageDoesNotExistError()
    }

    return {
      page
    }
  }
}
