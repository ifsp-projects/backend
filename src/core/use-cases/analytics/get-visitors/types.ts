import type {
  VisitorsRequest,
  VisitorsResponse
} from 'capivara-solidaria-ts-sdk'

import type {
  VisitorsEvent,
  VisitorsQueryConfig
} from '@/adapters/outbound/posthog/visitors-query'

export type GetVisitorsDependencies = {
  findOwnership: (slug: string) => Promise<{ ong_id: string } | null>
  getConfig: () => VisitorsQueryConfig
  queryEvents: (input: {
    slug: string
    startUtc: string
    endUtc: string
    config: VisitorsQueryConfig
  }) => Promise<VisitorsEvent[]>
  now?: () => Date
}

export type GetVisitorsInput = {
  organizationId: string
  request: VisitorsRequest
}

export type GetVisitorsResult = {
  response: VisitorsResponse
  cacheHit: boolean
}
