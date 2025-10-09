import z from 'zod'

import { createOrganizationSchema } from './schema'

export type CreateOrganizationProps = z.infer<typeof createOrganizationSchema>
