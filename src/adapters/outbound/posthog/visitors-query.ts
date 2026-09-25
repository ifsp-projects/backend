import {
  isPublicPageUrl,
  publicPagePrefix
} from '@/core/use-cases/analytics/get-visitors/page-filter'

export type VisitorsEvent = {
  timestamp: string
  distinctId: string | null
  referrer: string | null
  deviceType: string | null
}

export type VisitorsQueryConfig = {
  apiHost: string
  projectId: string
  apiKey: string
  publicHost: string
}

export class VisitorsQueryError extends Error {
  constructor() {
    super('Visitors data is temporarily unavailable')
  }
}

const PAGE_SIZE = 10000
const QUERY = `SELECT timestamp, toString(uuid), distinct_id, properties.$current_url, properties.$referrer, properties.$device_type
FROM events
WHERE event = '$pageview'
  AND timestamp >= toDateTime({startSeconds}, 'UTC')
  AND timestamp < toDateTime({endSeconds}, 'UTC')
  AND startsWith(lower(toString(properties.$current_url)), {urlPrefix})
  AND (timestamp > toDateTime64({cursorTimestamp}, 6, 'UTC')
    OR (timestamp = toDateTime64({cursorTimestamp}, 6, 'UTC') AND toString(uuid) > {cursorUuid}))
ORDER BY timestamp, toString(uuid)
LIMIT 10000`

type QueryInput = {
  slug: string
  startUtc: string
  endUtc: string
  config: VisitorsQueryConfig
  fetcher?: typeof fetch
  timeoutMs?: number
}

const readRow = (
  row: unknown
): [
  string,
  string,
  string | null,
  string | null,
  string | null,
  string | null
] => {
  if (
    !Array.isArray(row) ||
    row.length !== 6 ||
    typeof row[0] !== 'string' ||
    Number.isNaN(Date.parse(row[0])) ||
    typeof row[1] !== 'string' ||
    row[1].length === 0 ||
    (row[2] !== null && typeof row[2] !== 'string') ||
    (row[3] !== null && typeof row[3] !== 'string') ||
    (row[4] !== null && typeof row[4] !== 'string') ||
    (row[5] !== null && typeof row[5] !== 'string')
  ) {
    throw new VisitorsQueryError()
  }
  return row as [
    string,
    string,
    string | null,
    string | null,
    string | null,
    string | null
  ]
}

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
  )
    throw new VisitorsQueryError()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const events: VisitorsEvent[] = []
  let cursorTimestamp = startUtc
  let cursorUuid = ''
  try {
    for (;;) {
      const previousTimestamp = cursorTimestamp
      const previousUuid = cursorUuid
      const response = await fetcher(
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
      )
      if (controller.signal.aborted) throw new VisitorsQueryError()
      if (!response.ok) throw new VisitorsQueryError()
      const payload: unknown = await response.json()
      if (controller.signal.aborted) throw new VisitorsQueryError()
      if (
        !payload ||
        typeof payload !== 'object' ||
        !('results' in payload) ||
        !Array.isArray(payload.results) ||
        payload.results.length > PAGE_SIZE
      )
        throw new VisitorsQueryError()
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
      if (
        payload.results.length < PAGE_SIZE &&
        !('hasMore' in payload && payload.hasMore === true)
      )
        return events
      if (
        payload.results.length === 0 ||
        (cursorTimestamp === previousTimestamp && cursorUuid === previousUuid)
      ) {
        throw new VisitorsQueryError()
      }
    }
  } catch {
    throw new VisitorsQueryError()
  } finally {
    clearTimeout(timeout)
  }
}
