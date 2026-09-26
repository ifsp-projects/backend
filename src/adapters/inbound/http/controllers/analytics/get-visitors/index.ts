import type { FastifyReply, FastifyRequest } from 'fastify'

import { Route } from '@/adapters/inbound/http/decorators/route-decorator'
import { queryVisitorsEvents } from '@/adapters/outbound/posthog/visitors-query'
import { OrganizationsProfilesRepository } from '@/adapters/outbound/prisma/repositories/organization-profiles-repository'
import { env, getAnalyticsIntegrationConfig } from '@/config/env'
import { GetVisitorsUseCase } from '@/core/use-cases/analytics/get-visitors'
import { VisitorsRateLimit } from '@/core/use-cases/analytics/get-visitors/rate-limit'
import { JwtService } from '@/shared/infra/auth/jwt'
import { resolveControllerError } from '@/shared/utils/controllers/controller-error'
import { extractBearerToken } from '@/shared/utils/controllers/extract-bearer-token'
import { sendJsonError } from '@/shared/utils/controllers/send-json-error'

import { Trace } from '../../../decorators/trace-decorator'
import { visitorsErrorMappings } from './error-mappings'
import { logVisitorsOutcome } from './log-outcome'
import { parseGetVisitorsQuery } from './schema'
import type { VisitorsExecutor } from './types'

const sendFailure = (
  request: FastifyRequest,
  reply: FastifyReply,
  started: number,
  status: number,
  message: string
): FastifyReply => {
  logVisitorsOutcome({
    request,
    started,
    status,
    cache: 'none',
    failure: message
  })
  return sendJsonError(reply, status, message)
}

const buildDefaultUseCase = (): VisitorsExecutor => {
  const profiles = new OrganizationsProfilesRepository()
  return new GetVisitorsUseCase({
    findOwnership: slug => profiles.getOrganizationOwnershipBySlug(slug),
    getConfig: getAnalyticsIntegrationConfig,
    queryEvents: queryVisitorsEvents
  })
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
    this.useCase = dependencies?.useCase ?? buildDefaultUseCase()
    this.jwt = dependencies?.jwt ?? new JwtService(env.JWT_SECRET)
    this.rateLimit = dependencies?.rateLimit ?? new VisitorsRateLimit()
  }

  @Route('GET', '/analytics/visitors')
  @Trace('analytics.get_visitors')
  async execute(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const started = performance.now()

    const token = extractBearerToken(request.headers.authorization)
    if (!token) return sendFailure(request, reply, started, 401, 'Unauthorized')

    let organizationId: string
    try {
      organizationId = this.jwt.verifyToken(token).id
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
      logVisitorsOutcome({
        request,
        started,
        status: 200,
        cache: result.cacheHit ? 'hit' : 'miss'
      })
      return reply.status(200).send(result.response)
    } catch (error) {
      const resolved = resolveControllerError(
        error,
        reply,
        visitorsErrorMappings
      )
      return sendFailure(
        request,
        resolved.reply,
        started,
        resolved.status,
        resolved.message
      )
    }
  }
}

export const getVisitorsController = new GetVisitorsController()
