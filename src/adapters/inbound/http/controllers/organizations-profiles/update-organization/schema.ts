import { toOngCategory } from 'capivara-solidaria-ts-sdk'
import { z } from 'zod'

import { toPrismaOngCategory } from '@/shared/utils/formatters/format-ong-type'

export const updateOrganizationParamsSchema = z.object({
  id: z.string()
})

export const updateOrganizationBodySchema = z.object({
  slug: z.string().nonempty(),
  logo: z.string().optional(),
  phone: z.string().optional(),
  ong_description: z.string().optional(),
  ong_type: z
    .string()
    .optional()
    .transform(val => (val ? toOngCategory(val) : undefined))
    .refine(val => val !== undefined || val === undefined, {
      message: 'Invalid ONG category'
    })
    .transform(val => (val ? toPrismaOngCategory(val) : undefined)),
  design_template: z
    .enum(['primary', 'secondary', 'tertiary', 'quarternary'])
    .optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  instagram_url: z.string().optional(),
  facebook_url: z.string().optional(),
  twitter_url: z.string().optional()
})
