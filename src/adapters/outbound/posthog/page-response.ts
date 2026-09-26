import { PAGE_SIZE } from './query'

export const isValidPage = (
  payload: unknown
): payload is { results: unknown[]; hasMore?: boolean } =>
  !!payload &&
  typeof payload === 'object' &&
  'results' in payload &&
  Array.isArray(payload.results) &&
  payload.results.length <= PAGE_SIZE

export const isLastPage = (
  resultsLength: number,
  hasMore: boolean | undefined
): boolean => resultsLength < PAGE_SIZE && hasMore !== true

export const isCursorStuck = (
  previous: { timestamp: string; uuid: string },
  current: { timestamp: string; uuid: string }
): boolean =>
  previous.timestamp === current.timestamp && previous.uuid === current.uuid
