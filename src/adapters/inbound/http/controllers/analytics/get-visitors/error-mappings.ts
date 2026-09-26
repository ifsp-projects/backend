import { AnalyticsIntegrationUnavailableError } from '@/config/env'
import { VisitorsQueryError } from '@/core/domain/exceptions/analytics'
import {
  VisitorsForbiddenError,
  VisitorsSlugNotFoundError
} from '@/core/use-cases/analytics/get-visitors'
import { InvalidVisitorsFilterError } from '@/core/use-cases/analytics/get-visitors/period'
import { VisitorsRateLimitError } from '@/core/use-cases/analytics/get-visitors/rate-limit'
import type { ControllerErrorMapping } from '@/shared/utils/controllers/controller-error/types'

export const visitorsErrorMappings: ControllerErrorMapping[] = [
  { error: InvalidVisitorsFilterError, status: 400 },
  { error: VisitorsForbiddenError, status: 403 },
  { error: VisitorsSlugNotFoundError, status: 404 },
  {
    error: VisitorsRateLimitError,
    status: 429,
    onMatch: (error, reply) =>
      reply.header(
        'Retry-After',
        String((error as VisitorsRateLimitError).retryAfter)
      )
  },
  { error: VisitorsQueryError, status: 502 },
  { error: AnalyticsIntegrationUnavailableError, status: 503 }
]
