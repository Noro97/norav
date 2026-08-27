import { describe, expect, it, afterEach } from 'vitest'
import { previewToken } from '../ContentProvider'

function at(hash: string) {
  window.location.hash = hash
}

afterEach(() => {
  window.location.hash = ''
})

describe('previewToken', () => {
  it('reads the key from the fragment', () => {
    at('#preview=abc123')
    expect(previewToken()).toBe('abc123')
  })

  it('ignores the query string', () => {
    // The key is deliberately in the fragment, which never reaches a server.
    // Accepting it from the query too would undo that the first time someone
    // copied a link out of an address bar and pasted it somewhere logged.
    window.history.replaceState({}, '', '/?preview=from-the-query')
    expect(previewToken()).toBeNull()
    window.history.replaceState({}, '', '/')
  })

  it('finds the key beside other fragment values', () => {
    at('#section=about&preview=abc123')
    expect(previewToken()).toBe('abc123')
  })

  it('is null on an ordinary visit', () => {
    expect(previewToken()).toBeNull()
    at('#about')
    expect(previewToken()).toBeNull()
  })

  it('survives a key that needs escaping', () => {
    at(`#preview=${encodeURIComponent('a+b/c=')}`)
    expect(previewToken()).toBe('a+b/c=')
  })
})
