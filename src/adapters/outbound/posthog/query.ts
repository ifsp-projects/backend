export const PAGE_SIZE = 10000

export const QUERY = `SELECT timestamp, toString(uuid), distinct_id, properties.$current_url, properties.$referrer, properties.$device_type
FROM events
WHERE event = '$pageview'
  AND timestamp >= toDateTime({startSeconds}, 'UTC')
  AND timestamp < toDateTime({endSeconds}, 'UTC')
  AND startsWith(lower(toString(properties.$current_url)), {urlPrefix})
  AND (timestamp > toDateTime64({cursorTimestamp}, 6, 'UTC')
    OR (timestamp = toDateTime64({cursorTimestamp}, 6, 'UTC') AND toString(uuid) > {cursorUuid}))
ORDER BY timestamp, toString(uuid)
LIMIT ${PAGE_SIZE}`
