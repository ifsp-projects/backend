import { toCampaignGoalType, toCampaignType } from 'capivara-solidaria-ts-sdk'
import { z } from 'zod'

import { toPrismaCampaignGoalType } from '@/shared/utils/formatters/format-campaign-goal-type'
import { toPrismaCampaignType } from '@/shared/utils/formatters/format-campaign-type'

export const createCampaignProfileBodySchema = z.object({
  ong_id: z.string().nonempty(),
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  short_description: z.string().nonempty(),
  cover_image: z.string().optional(),
  banner_image: z.string().optional(),
  location: z.string().nonempty(),
  type: z
    .string()
    .transform(val => (val ? toCampaignType(val) : undefined))
    .refine(val => val !== undefined || val === undefined, {
      message: 'Invalid campaign type'
    })
    .transform(val => (val ? toPrismaCampaignType(val) : undefined)),
  goal_type: z
    .string()
    .transform(val => (val ? toCampaignGoalType(val) : undefined))
    .refine(val => val !== undefined || val === undefined, {
      message: 'Invalid campaign goal type'
    })
    .transform(val => (val ? toPrismaCampaignGoalType(val) : undefined)),
  start_date: z
    .string()
    .datetime()
    .transform(value => new Date(value)),
  end_date: z
    .string()
    .datetime()
    .transform(value => new Date(value)),
  goal_value: z.number().nonoptional()
})
