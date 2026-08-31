import { describe, expect, it, afterEach } from 'vitest'
import { NextResponse } from 'next/server'
import { canonicalOrigin, withCors } from '../http'

const saved = process.env.SITE_ORIGIN
afterEach(() => {
  if (saved === undefined) delete process.env.SITE_ORIGIN
  else process.env.SITE_ORIGIN = saved
})

const ask = (from?: string) =>
  withCors(
    NextResponse.json({}),
    from ? new Request('https://cms.norav.dev/api/public/manifest', { headers: { origin: from } }) : undefined,
  ).headers.get('Access-Control-Allow-Origin')

describe('withCors', () => {
  it('echoes an origin that is on the list', () => {
    // The point of the list: a laptop reads what the deployed CMS has published,
    // instead of whatever content happens to be committed.
    process.env.SITE_ORIGIN = 'https://norav.dev,http://localhost:5173'
    expect(ask('http://localhost:5173')).toBe('http://localhost:5173')
    expect(ask('https://norav.dev')).toBe('https://norav.dev')
  })

  it('refuses an origin that is not', () => {
    process.env.SITE_ORIGIN = 'https://norav.dev,http://localhost:5173'
    // Answered with the first allowed origin rather than the caller's, so the
    // browser blocks it — and never with the header missing, which some clients
    // treat as permission.
    expect(ask('https://example.com')).toBe('https://norav.dev')
  })

  it('is unrestricted only when nothing is configured', () => {
    delete process.env.SITE_ORIGIN
    expect(ask('https://example.com')).toBe('*')
  })

  it('ignores a trailing slash on either side', () => {
    process.env.SITE_ORIGIN = 'https://norav.dev/'
    expect(ask('https://norav.dev')).toBe('https://norav.dev')
  })

  it('varies on Origin, so a CDN cannot serve one caller the answer for another', () => {
    process.env.SITE_ORIGIN = 'https://norav.dev'
    expect(withCors(NextResponse.json({})).headers.get('Vary')).toBe('Origin')
  })
})

describe('canonicalOrigin', () => {
  it('takes the first entry, not the whole list', () => {
    // The preview link is built from this. Handing it the raw value produced
    // https://norav.dev,http://localhost:5173/#preview=… — a URL that resolves
    // to nothing, which is how the list broke preview.
    process.env.SITE_ORIGIN = 'https://norav.dev,http://localhost:5173'
    expect(canonicalOrigin()).toBe('https://norav.dev')
  })

  it('drops a trailing slash, so the caller can append a path', () => {
    process.env.SITE_ORIGIN = 'https://norav.dev/'
    expect(canonicalOrigin()).toBe('https://norav.dev')
  })

  it('falls back when nothing is set', () => {
    delete process.env.SITE_ORIGIN
    expect(canonicalOrigin()).toBe('https://norav.dev')
    expect(canonicalOrigin('http://localhost:5173')).toBe('http://localhost:5173')
  })
})
