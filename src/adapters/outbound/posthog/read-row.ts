import { VisitorsQueryError } from '@/core/domain/exceptions/analytics'

export const readRow = (
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
