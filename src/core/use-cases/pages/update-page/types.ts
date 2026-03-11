import { Page, Prisma } from '@prisma-generated'

export interface UpdatePageUseCasePayload
  extends Omit<Prisma.PageUncheckedUpdateInput, 'id'> {
  id: string
}

export interface UpdatePageUseCaseReturn {
  page: Page
}
