import { PagesRepository } from '@/core/ports/repositories/prisma/pages-repository'

import { UpdatePageUseCasePayload, UpdatePageUseCaseReturn } from './types'
import { PageDoesNotExistError } from '@/core/domain/exceptions/pages'

import { deepMerge } from '@/shared/utils/helpers/deep-merge'

export class UpdatePageUseCase {
  constructor(protected readonly pagesRepository: PagesRepository) {}

  execute = async (
    payload: UpdatePageUseCasePayload
  ): Promise<UpdatePageUseCaseReturn> => {
    const { id, sections } = payload

    const currentPage = await this.pagesRepository.getPageById(id)

    if (!currentPage) {
      throw new PageDoesNotExistError()
    }

    const mergedSections = deepMerge(currentPage.sections, sections)

    const updatedPage = await this.pagesRepository.updatePage(id, {
      ...payload,
      sections: mergedSections
    })

    return {
      page: updatedPage
    }
  }
}
