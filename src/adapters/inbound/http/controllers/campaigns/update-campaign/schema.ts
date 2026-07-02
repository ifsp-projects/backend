import { toCampaignStatus } from 'capivara-solidaria-ts-sdk'
import { z } from 'zod'

import { toPrismaCampaignStatus } from '@/shared/utils/formatters/format-campaign-status'

export const updateCampaignParamsSchema = z.object({
  id: z.string()
})

export const updateCampaignBodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  cover_image: z.string().optional(),
  banner_image: z.string().optional(),
  location: z.string().optional(),
  start_date: z
    .string()
    .datetime()
    .transform(value => new Date(value))
    .optional(),
  end_date: z
    .string()
    .datetime()
    .transform(value => new Date(value))
    .optional(),
  status: z
    .string()
    .optional()
    .transform(val => (val ? toCampaignStatus(val) : undefined))
    .refine(val => val !== undefined || val === undefined, {
      message: 'Invalid campaign type'
    })
    .transform(val => (val ? toPrismaCampaignStatus(val) : undefined))
})
