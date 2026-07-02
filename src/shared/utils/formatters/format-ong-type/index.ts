import type { OngCategory } from 'capivara-solidaria-ts-sdk'

import type { OngCategoryEnum } from '@prisma-generated'

export const toPrismaOngCategory = (value: OngCategory): OngCategoryEnum =>
  value as unknown as OngCategoryEnum

export const fromPrismaOngCategory = (value: OngCategoryEnum): OngCategory =>
  value as unknown as OngCategory
