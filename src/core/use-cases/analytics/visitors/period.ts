import type { VisitorsRange, VisitorsRequest } from 'capivara-solidaria-ts-sdk'

export const VISITORS_TIMEZONE = 'America/Sao_Paulo' as const

export class InvalidVisitorsFilterError extends Error {
  constructor() {
    super('Invalid visitors filter')
  }
}

const calendarDate = (instant: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: VISITORS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(instant)

export const shiftDate = (date: string, days: number): string => {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export const isCalendarDate = (date: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  !Number.isNaN(Date.parse(`${date}T12:00:00Z`)) &&
  new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date

export const localMidnightUtc = (date: string): string => {
  if (!isCalendarDate(date)) throw new InvalidVisitorsFilterError()

  const target = Date.parse(`${date}T00:00:00Z`)
  let timestamp = target
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: VISITORS_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date(timestamp))
    const part = (name: string) =>
      Number(parts.find(item => item.type === name)?.value)
    const local = Date.UTC(
      part('year'),
      part('month') - 1,
      part('day'),
      part('hour'),
      part('minute'),
      part('second')
    )
    timestamp += target - local
  }
  return new Date(timestamp).toISOString()
}

export type VisitorsWindow = {
  range: VisitorsRange
  periodStart: string
  periodEnd: string
  startUtc: string
  endUtc: string
  previousStartUtc: string
  selectedDate: string | null
  selectedStartUtc: string | null
  selectedEndUtc: string | null
  previousDayStartUtc: string | null
}

export const parseVisitorsRequest = (
  params: URLSearchParams
): VisitorsRequest => {
  for (const key of ['slug', 'range', 'date']) {
    if (params.getAll(key).length > 1) throw new InvalidVisitorsFilterError()
  }
  if (
    [...params.keys()].some(key => !['slug', 'range', 'date'].includes(key))
  ) {
    throw new InvalidVisitorsFilterError()
  }
  const slug = params.get('slug')
  const range = params.get('range')
  const date = params.get('date')
  if (!slug || slug.length > 200 || /[\s/\\\x00-\x1f\x7f]/.test(slug)) {
    throw new InvalidVisitorsFilterError()
  }
  if (range !== '7d' && range !== '30d') throw new InvalidVisitorsFilterError()
  if (date !== null && !isCalendarDate(date))
    throw new InvalidVisitorsFilterError()
  return { slug, range, ...(date === null ? {} : { date }) }
}

export const getVisitorsWindow = (
  request: VisitorsRequest,
  now: Date = new Date()
): VisitorsWindow => {
  if (!Number.isFinite(now.getTime())) throw new InvalidVisitorsFilterError()
  const today = calendarDate(now)
  const length = request.range === '7d' ? 7 : request.range === '30d' ? 30 : 0
  if (length === 0) throw new InvalidVisitorsFilterError()
  const periodStart = shiftDate(today, -length)
  const periodEnd = shiftDate(today, -1)
  if (
    request.date !== undefined &&
    (!isCalendarDate(request.date) ||
      request.date < periodStart ||
      request.date > periodEnd)
  ) {
    throw new InvalidVisitorsFilterError()
  }
  const selectedDate = request.date ?? null
  return {
    range: request.range,
    periodStart,
    periodEnd,
    startUtc: localMidnightUtc(periodStart),
    endUtc: localMidnightUtc(today),
    previousStartUtc: localMidnightUtc(shiftDate(periodStart, -length)),
    selectedDate,
    selectedStartUtc: selectedDate ? localMidnightUtc(selectedDate) : null,
    selectedEndUtc: selectedDate
      ? localMidnightUtc(shiftDate(selectedDate, 1))
      : null,
    previousDayStartUtc: selectedDate
      ? localMidnightUtc(shiftDate(selectedDate, -1))
      : null
  }
}
