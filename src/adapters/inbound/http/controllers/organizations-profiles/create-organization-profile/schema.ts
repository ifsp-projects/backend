import { toOngCategory } from 'capivara-solidaria-ts-sdk'
import { z } from 'zod'

import { toPrismaOngCategory } from '@/shared/utils/formatters/format-ong-type'

export const createOrganizationProfileBodySchema = z.object({
  ong_id: z.string().nonempty(),
  name: z.string().nonempty(),
  slug: z.string().nonempty(),
  logo: z.string().nonempty(),
  phone: z.string().nonempty(),
  ong_description: z.string().nonempty(),
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
    .default('primary')
})
