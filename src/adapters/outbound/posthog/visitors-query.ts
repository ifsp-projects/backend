import { VisitorsQueryError } from '@/core/domain/exceptions/analytics'
import {
  isPublicPageUrl,
  publicPagePrefix
} from '@/core/use-cases/analytics/get-visitors/page-filter'
import { observeDependency } from '@/shared/infra/open-telemetry/dependency-metrics'

import { isCursorStuck, isLastPage, isValidPage } from './page-response'
import { QUERY } from './query'
import { readRow } from './read-row'
import type { QueryInput, VisitorsEvent } from './types'

export type { VisitorsEvent, VisitorsQueryConfig } from './types'

export const queryVisitorsEvents = async ({
  slug,
  startUtc,
  endUtc,
  config,
  fetcher = fetch,
  timeoutMs = 8000
}: QueryInput): Promise<VisitorsEvent[]> => {
  const startSeconds = Date.parse(startUtc) / 1000
  const endSeconds = Date.parse(endUtc) / 1000

  if (
    !Number.isSafeInteger(startSeconds) ||
    !Number.isSafeInteger(endSeconds) ||
    startSeconds >= endSeconds
  ) {
    throw new VisitorsQueryError()
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const events: VisitorsEvent[] = []

  let cursorTimestamp = new Date(Date.parse(startUtc) - 1).toISOString()
  let cursorUuid = ''

  try {
    for (;;) {
      const previousTimestamp = cursorTimestamp
      const previousUuid = cursorUuid
      const response = await observeDependency('posthog', 'query', () =>
        fetcher(
          `${config.apiHost}/api/projects/${encodeURIComponent(config.projectId)}/query/`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: 'Visitors public page',
              query: {
                kind: 'HogQLQuery',
                query: QUERY,
                values: {
                  startSeconds,
                  endSeconds,
                  urlPrefix: publicPagePrefix(
                    config.publicHost,
                    slug
                  ).toLowerCase(),
                  cursorTimestamp,
                  cursorUuid
                }
              }
            }),
            signal: controller.signal
          }
        ).then(response => {
          if (!response.ok) throw new VisitorsQueryError()
          return response
        })
      )

      if (controller.signal.aborted) throw new VisitorsQueryError()

      const payload: unknown = await response.json()

      if (controller.signal.aborted) throw new VisitorsQueryError()

      if (isValidPage(payload) === false) throw new VisitorsQueryError()

      for (const raw of payload.results) {
        const [timestamp, uuid, distinctId, currentUrl, referrer, deviceType] =
          readRow(raw)
        const instant = Date.parse(timestamp)
        if (instant < startSeconds * 1000 || instant >= endSeconds * 1000) {
          throw new VisitorsQueryError()
        }
        cursorTimestamp = timestamp
        cursorUuid = uuid
        if (isPublicPageUrl(currentUrl, config.publicHost, slug)) {
          events.push({ timestamp, distinctId, referrer, deviceType })
        }
      }

      if (isLastPage(payload.results.length, payload.hasMore)) return events

      if (
        payload.results.length === 0 ||
        isCursorStuck(
          { timestamp: previousTimestamp, uuid: previousUuid },
          { timestamp: cursorTimestamp, uuid: cursorUuid }
        )
      ) {
        throw new VisitorsQueryError()
      }
    }
  } catch (cause) {
    throw new VisitorsQueryError({ cause })
  } finally {
    clearTimeout(timeout)
  }
}
