import { PagesRepository } from '@/core/ports/repositories/prisma/pages-repository'

import { UpdatePageUseCasePayload, UpdatePageUseCaseReturn } from './types'
import { PageDoesNotExistError } from '@/core/domain/exceptions/pages'

export class UpdatePageUseCase {
  constructor(protected readonly pagesRepository: PagesRepository) {}

  execute = async (
    payload: UpdatePageUseCasePayload
  ): Promise<UpdatePageUseCaseReturn> => {
    const { id } = payload

    const pageExists = await this.pagesRepository.getPageById(id)

    if (!pageExists) {
      throw new PageDoesNotExistError()
    }

    const updatedPage = await this.pagesRepository.updatePage(id, payload)

    return {
      page: updatedPage
    }
  }
}
