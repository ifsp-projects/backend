import type { CampaignType } from 'capivara-solidaria-ts-sdk'

import type { CampaignTypeEnum } from '@prisma-generated'

export const toPrismaCampaignType = (value: CampaignType): CampaignTypeEnum =>
  value as unknown as CampaignTypeEnum

export const fromPrismaCampaignType = (value: CampaignTypeEnum): CampaignType =>
  value as unknown as CampaignType
