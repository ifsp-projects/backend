export const publicPagePrefix = (publicHost: string, slug: string): string =>
  `https://${publicHost}/ongs/${encodeURIComponent(slug)}`

export const isPublicPageUrl = (
  value: unknown,
  publicHost: string,
  slug: string
): boolean => {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      url.hostname === publicHost &&
      url.port === '' &&
      url.username === '' &&
      url.password === '' &&
      (url.pathname === `/ongs/${encodeURIComponent(slug)}` ||
        url.pathname === `/ongs/${encodeURIComponent(slug)}/`)
    )
  } catch {
    return false
  }
}
