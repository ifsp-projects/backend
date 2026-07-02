import type { CampaignGoalType } from 'capivara-solidaria-ts-sdk'

import type { CampaignGoalTypeEnum } from '@prisma-generated'

export const toPrismaCampaignGoalType = (
  value: CampaignGoalType
): CampaignGoalTypeEnum => value as unknown as CampaignGoalTypeEnum

export const fromPrismaCampaignGoalType = (
  value: CampaignGoalTypeEnum
): CampaignGoalType => value as unknown as CampaignGoalType
