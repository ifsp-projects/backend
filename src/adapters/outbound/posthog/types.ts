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

export type QueryInput = {
  slug: string
  startUtc: string
  endUtc: string
  config: VisitorsQueryConfig
  fetcher?: typeof fetch
  timeoutMs?: number
}
