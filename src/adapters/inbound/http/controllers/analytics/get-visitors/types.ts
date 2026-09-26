import type { FastifyRequest } from 'fastify'

import type { GetVisitorsUseCase } from '@/core/use-cases/analytics/get-visitors'

export type VisitorsExecutor = Pick<GetVisitorsUseCase, 'execute'>

export type CacheStatus = 'hit' | 'miss' | 'none'

export interface LogVisitorsOutcomeInput {
  cache: CacheStatus
  failure?: string
  request: FastifyRequest
  started: number
  status: number
}
