import { elapsedMs } from '@/shared/utils/helpers/elapsed-ms'

import type { LogVisitorsOutcomeInput } from './types'

export const logVisitorsOutcome = ({
  request,
  started,
  status,
  cache,
  failure
}: LogVisitorsOutcomeInput): void => {
  const fields = {
    duration_ms: elapsedMs(started),
    status,
    cache,
    ...(failure ? { failure } : {})
  }
  if (failure) {
    request.log.warn(fields, 'analytics visitors request')
  } else {
    request.log.info(fields, 'analytics visitors request')
  }
}
