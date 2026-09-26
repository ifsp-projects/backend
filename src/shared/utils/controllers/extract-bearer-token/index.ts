export const extractBearerToken = (
  header: string | undefined
): string | null => {
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice(7)
  return token.length > 0 ? token : null
}
