import { Page, Prisma } from '@prisma/client'

export interface PagesInterface {
  getPageBySlug: (slug: string) => Promise<Page | null>
  getPageById: (id: string) => Promise<Page | null>
  updatePage(
    id: string,
    payload: Prisma.PageUncheckedUpdateInput
  ): Promise<Page | null>
}
