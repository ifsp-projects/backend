import type { CampaignStatus } from 'capivara-solidaria-ts-sdk'

import type { CampaignStatusEnum } from '@prisma-generated'

export const toPrismaCampaignStatus = (
  value: CampaignStatus
): CampaignStatusEnum => value as unknown as CampaignStatusEnum

export const fromPrismaCampaignStatus = (
  value: CampaignStatusEnum
): CampaignStatus => value as unknown as CampaignStatus
