import {
  isHubspotOngValue,
  toPrismaOngCategory
} from '@/shared/utils/formatters/format-ong-type'
import { OngCategory } from '@prisma-generated'
import { z } from 'zod'

export const updateOrganizationParamsSchema = z.object({
  id: z.string()
})

const isPrismaOngCategory = (val: string): val is OngCategory => {
  return Object.values(OngCategory).includes(val as OngCategory)
}

export const updateOrganizationBodySchema = z.object({
  logo: z.string().optional(),
  phone: z.string().optional(),
  ong_description: z.string().optional(),
  ong_type: z
    .string()
    .optional()
    .refine(val => !val || isHubspotOngValue(val) || isPrismaOngCategory(val), {
      message: 'Invalid ONG category'
    })
    .transform(val => {
      if (!val) return undefined
      if (isPrismaOngCategory(val)) return val as OngCategory
      return toPrismaOngCategory(val)
    }),
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
