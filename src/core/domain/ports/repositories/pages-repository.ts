import type { Page, Prisma } from '@prisma-generated'

export interface PagesInterface {
  getPageById: (id: string) => Promise<Page | null>
  getPageBySlug: (slug: string) => Promise<Page | null>
  updatePage(
    id: string,
    payload: Prisma.PageUncheckedUpdateInput
  ): Promise<Page | null>
}
