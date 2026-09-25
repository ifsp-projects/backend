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

const sendFailure = (
  request: FastifyRequest,
  reply: FastifyReply,
  started: number,
  status: number,
  message: string
): FastifyReply => {
  request.log.warn(
    {
      duration_ms: Math.round(performance.now() - started),
      status,
      cache: 'none',
      failure: message
    },
    'analytics visitors request'
  )
  return reply.status(status).send({ error: message })
}

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
    const started = performance.now()
    const authorization = request.headers.authorization
    if (!authorization?.startsWith('Bearer ') || !authorization.slice(7)) {
      return sendFailure(request, reply, started, 401, 'Unauthorized')
    }
    let organizationId: string
    try {
      organizationId = this.jwt.verifyToken(authorization.slice(7)).id
    } catch {
      return sendFailure(request, reply, started, 401, 'Unauthorized')
    }

    try {
      const visitorsRequest = parseGetVisitorsQuery(request)
      this.rateLimit.check(organizationId)
      const result = await this.useCase.execute({
        organizationId,
        request: visitorsRequest
      })
      request.log.info(
        {
          duration_ms: Math.round(performance.now() - started),
          status: 200,
          cache: result.cacheHit ? 'hit' : 'miss'
        },
        'analytics visitors request'
      )
      return reply.status(200).send(result.response)
    } catch (error) {
      if (error instanceof InvalidVisitorsFilterError)
        return sendFailure(
          request,
          reply,
          started,
          400,
          'Invalid visitors filter'
        )
      if (error instanceof VisitorsForbiddenError)
        return sendFailure(request, reply, started, 403, 'Forbidden')
      if (error instanceof VisitorsSlugNotFoundError)
        return sendFailure(
          request,
          reply,
          started,
          404,
          'Organization not found'
        )
      if (error instanceof VisitorsRateLimitError)
        return sendFailure(
          request,
          reply.header('Retry-After', String(error.retryAfter)),
          started,
          429,
          'Too many requests'
        )
      if (error instanceof VisitorsQueryError)
        return sendFailure(
          request,
          reply,
          started,
          502,
          'Visitors data is temporarily unavailable'
        )
      if (error instanceof AnalyticsIntegrationUnavailableError)
        return sendFailure(
          request,
          reply,
          started,
          503,
          'Analytics integration unavailable'
        )
      return sendFailure(request, reply, started, 500, 'Internal server error')
    }
  }
}

export const getVisitorsController = new GetVisitorsController()
