import { VisitorsCache } from './cache'
import { summarizeDay } from './day-summary'
import { classifyDevices } from './devices'
import { VISITORS_TIMEZONE, getVisitorsWindow } from './period'
import { eventDate, summarizePeriod } from './period-summary'
import { classifySources } from './sources'
import type {
  GetVisitorsDependencies,
  GetVisitorsInput,
  GetVisitorsResult
} from './types'

export class VisitorsSlugNotFoundError extends Error {}
export class VisitorsForbiddenError extends Error {}

export class GetVisitorsUseCase {
  constructor(
    private readonly dependencies: GetVisitorsDependencies,
    private readonly cache: VisitorsCache = new VisitorsCache()
  ) {}

  async execute({
    organizationId,
    request
  }: GetVisitorsInput): Promise<GetVisitorsResult> {
    const ownership = await this.dependencies.findOwnership(request.slug)
    if (!ownership) throw new VisitorsSlugNotFoundError()
    if (ownership.ong_id !== organizationId) throw new VisitorsForbiddenError()

    const now = this.dependencies.now?.() ?? new Date()
    const window = getVisitorsWindow(request, now)
    const config = this.dependencies.getConfig()
    const { value, cacheHit } = await this.cache.getOrLoad(
      {
        projectId: config.projectId,
        organizationId,
        slug: request.slug,
        range: request.range,
        periodStart: window.periodStart,
        periodEnd: window.periodEnd,
        selectedDate: window.selectedDate
      },
      async () => {
        const current = await this.dependencies.queryEvents({
          slug: request.slug,
          startUtc: window.startUtc,
          endUtc: window.endUtc,
          config
        })
        const previous = await this.dependencies.queryEvents({
          slug: request.slug,
          startUtc: window.selectedDate
            ? window.previousDayStartUtc!
            : window.previousStartUtc,
          endUtc: window.selectedDate
            ? window.selectedStartUtc!
            : window.startUtc,
          config
        })
        const period = summarizePeriod(
          current,
          window.selectedDate ? [] : previous,
          window
        )
        const selected = window.selectedDate
          ? current.filter(
              event => eventDate(event.timestamp) === window.selectedDate
            )
          : current
        const summary = window.selectedDate
          ? summarizeDay(selected, previous)
          : null
        const base = {
          range: request.range,
          timezone: VISITORS_TIMEZONE,
          period_start: window.periodStart,
          period_end: window.periodEnd,
          updated_at: now.toISOString(),
          daily: period.daily,
          period_highlights: period.period_highlights,
          sources: classifySources(selected, config.publicHost),
          devices: classifyDevices(selected)
        }
        if (window.selectedDate && summary) {
          return { ...base, ...summary, selected_date: window.selectedDate }
        }
        return {
          ...base,
          unique_visitors: period.unique_visitors,
          pageviews: period.pageviews,
          views_per_visitor: period.views_per_visitor,
          previous_unique_visitors: period.previous_unique_visitors,
          change_pct: period.change_pct,
          selected_date: null,
          hourly: null,
          peak_hour: null
        }
      }
    )
    return { response: value, cacheHit }
  }
}
