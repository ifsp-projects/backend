import type { FastifyRequest } from 'fastify'

import {
  getVisitorsWindow,
  parseVisitorsRequest
} from '@/core/use-cases/analytics/get-visitors/period'

export const parseGetVisitorsQuery = (request: FastifyRequest) => {
  const params = new URL(request.raw.url ?? '', 'http://localhost').searchParams
  const input = parseVisitorsRequest(params)
  getVisitorsWindow(input)
  return input
}
