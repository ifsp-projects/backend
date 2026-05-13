import { PagesRepository } from '@/adapters/outbound/prisma/repositories/pages-repository'

import { UpdatePageUseCasePayload, UpdatePageUseCaseReturn } from './types'
import { PageDoesNotExistError } from '@/core/domain/exceptions/pages'

import { deepMerge } from '@/shared/utils/helpers/deep-merge'
import { generateColorVariants } from '@/shared/utils/generate-collor-pallete'
import { Prisma } from '@prisma-generated'

export class UpdatePageUseCase {
  constructor(protected readonly pagesRepository: PagesRepository) {}

  execute = async (
    payload: UpdatePageUseCasePayload
  ): Promise<UpdatePageUseCaseReturn> => {
    const { id, sections, main_color } = payload

    const currentPage = await this.pagesRepository.getPageById(id)

    if (!currentPage) {
      throw new PageDoesNotExistError()
    }

    const shouldUpdatePalette =
      main_color && main_color !== currentPage.main_color

      const color_palette = (shouldUpdatePalette
        ? generateColorVariants(main_color.toString())
        : currentPage.color_pallete) as Prisma.InputJsonValue
    const mergedSections = deepMerge(currentPage.sections, sections)

    const updatedPage = await this.pagesRepository.updatePage(id, {
      ...payload,
      color_pallete: color_palette,
      sections: mergedSections
    })

    return {
      page: updatedPage
    }
  }
}
