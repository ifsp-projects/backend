import { describe, expect, it } from 'vitest'

import { isPublicPageUrl, publicPagePrefix } from './page-filter'

describe('public page filter', () => {
  const host = 'capivara.org.br'
  const slug = 'minha-ong'

  it.each([
    'https://capivara.org.br/ongs/minha-ong',
    'https://capivara.org.br/ongs/minha-ong/?utm=abc#section'
  ])('accepts the exact public page %s', url => {
    expect(isPublicPageUrl(url, host, slug)).toBe(true)
  })

  it.each([
    'https://capivara.org.br/ongs/minha-ong-extra',
    'https://capivara.org.br/ongs/minha-ong/editor',
    'https://preview.capivara.org.br/ongs/minha-ong',
    'http://capivara.org.br/ongs/minha-ong',
    'https://evil.example/ongs/minha-ong',
    'https://capivara.org.br:444/ongs/minha-ong',
    'not a URL',
    null
  ])('rejects non-public URL %s', url => {
    expect(isPublicPageUrl(url, host, slug)).toBe(false)
  })

  it('provides a parameter value for the query', () => {
    expect(publicPagePrefix(host, slug)).toBe(
      'https://capivara.org.br/ongs/minha-ong'
    )
  })
})
