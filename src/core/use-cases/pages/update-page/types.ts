import { Page, Prisma } from '@prisma/client'

export interface UpdatePageUseCasePayload
  extends Omit<Prisma.PageUncheckedUpdateInput, 'id'> {
  id: string
}

export interface UpdatePageUseCaseReturn {
  page: Page
}
