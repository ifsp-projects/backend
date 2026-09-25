import type { FastifyReply, FastifyRequest } from 'fastify'

import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import {
  VisitorsQueryError,
  queryVisitorsEvents
} from '@/adapters/outbound/posthog/visitors-query'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import {
  AnalyticsIntegrationUnavailableError,
  env,
  getAnalyticsIntegrationConfig
} from '@/config/env'
import {
  GetVisitorsUseCase,
  VisitorsForbiddenError,
  VisitorsSlugNotFoundError
} from '@/core/use-cases/analytics/get-visitors'
import { InvalidVisitorsFilterError } from '@/core/use-cases/analytics/get-visitors/period'
import {
  VisitorsRateLimit,
  VisitorsRateLimitError
} from '@/core/use-cases/analytics/get-visitors/rate-limit'
import { JwtService } from '@/shared/infra/auth/jwt'

import { parseGetVisitorsQuery } from './schema'

type VisitorsExecutor = Pick<GetVisitorsUseCase, 'execute'>

export class GetVisitorsController {
  private readonly useCase: VisitorsExecutor
  private readonly jwt: JwtService
  private readonly rateLimit: VisitorsRateLimit

  constructor(dependencies?: {
    useCase?: VisitorsExecutor
    jwt?: JwtService
    rateLimit?: VisitorsRateLimit
  }) {
    const profiles = new OrganizationsProfilesRepository()
    this.useCase =
      dependencies?.useCase ??
      new GetVisitorsUseCase({
        findOwnership: slug => profiles.getOrganizationOwnershipBySlug(slug),
        getConfig: getAnalyticsIntegrationConfig,
        queryEvents: queryVisitorsEvents
      })
    this.jwt = dependencies?.jwt ?? new JwtService(env.JWT_SECRET)
    this.rateLimit = dependencies?.rateLimit ?? new VisitorsRateLimit()
  }

  @Route('GET', '/api/analytics/visitors')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const authorization = request.headers.authorization
    if (!authorization?.startsWith('Bearer ') || !authorization.slice(7)) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    let organizationId: string
    try {
      organizationId = this.jwt.verifyToken(authorization.slice(7)).id
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    try {
      const visitorsRequest = parseGetVisitorsQuery(request)
      this.rateLimit.check(organizationId)
      const result = await this.useCase.execute({
        organizationId,
        request: visitorsRequest
      })
      return reply.status(200).send(result.response)
    } catch (error) {
      if (error instanceof InvalidVisitorsFilterError)
        return reply.status(400).send({ error: 'Invalid visitors filter' })
      if (error instanceof VisitorsForbiddenError)
        return reply.status(403).send({ error: 'Forbidden' })
      if (error instanceof VisitorsSlugNotFoundError)
        return reply.status(404).send({ error: 'Organization not found' })
      if (error instanceof VisitorsRateLimitError)
        return reply
          .header('Retry-After', String(error.retryAfter))
          .status(429)
          .send({ error: 'Too many requests' })
      if (error instanceof VisitorsQueryError)
        return reply
          .status(502)
          .send({ error: 'Visitors data is temporarily unavailable' })
      if (error instanceof AnalyticsIntegrationUnavailableError)
        return reply
          .status(503)
          .send({ error: 'Analytics integration unavailable' })
      return reply.status(500).send({ error: 'Internal server error' })
    }
  }
}

export const getVisitorsController = new GetVisitorsController()
