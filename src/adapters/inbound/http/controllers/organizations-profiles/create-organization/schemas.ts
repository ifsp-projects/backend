import { isHubspotOngValue, toPrismaOngCategory } from '@/shared/utils/formatters/format-ong-type'
import { z } from 'zod'

export const createOrganizationProfileBodySchema = z.object({
  ong_id: z.string().nonempty(),
  name: z.string().nonempty(),
  slug: z.string().nonempty(),
  logo: z.string().nonempty(),
  phone: z.string().nonempty(),
  ong_type: z
    .string()
    .optional()
    .refine(val => !val || isHubspotOngValue(val), {
      message: 'Invalid ONG category'
    })
    .transform(val => (val ? toPrismaOngCategory(val) : undefined)),
  design_template: z.string().default('primary')
})
