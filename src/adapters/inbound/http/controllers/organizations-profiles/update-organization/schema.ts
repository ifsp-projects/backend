import {
  isHubspotOngValue,
  toPrismaOngCategory
} from '@/shared/utils/formatters/format-ong-type'
import { z } from 'zod'

export const updateOrganizationParamsSchema = z.object({
  id: z.string()
})

export const updateOrganizationBodySchema = z.object({
  logo: z.string().optional(),
  phone: z.string().optional(),
  ong_description: z.string().optional(),
  ong_type: z
    .string()
    .optional()
    .refine(val => !val || isHubspotOngValue(val), {
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
  postal_code: z.string().optional()
})
