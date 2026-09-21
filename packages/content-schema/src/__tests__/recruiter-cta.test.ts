import { describe, expect, it } from 'vitest'
import { getBlockDefinition, validateBlockContent, validateBlockSettings } from '../blocks'

describe('recruiter card', () => {
  const definition = getBlockDefinition('recruiter_cta')!

  it('is one card per site, owned by the CMS', () => {
    expect(definition.singleton).toBe(true)
    expect(definition.tier).toBe(1)
    expect(definition.form.length).toBeGreaterThan(0)
  })

  it('ships defaults that publish as they are', () => {
    expect(validateBlockContent('recruiter_cta', definition.defaults.content).ok).toBe(true)
    expect(validateBlockSettings('recruiter_cta', definition.defaults.settings).ok).toBe(true)
  })

  it('keeps the argument short', () => {
    const content = definition.defaults.content as Record<string, unknown>
    const point = { text: 'A point' }
    const five = { ...content, points: [point, point, point, point, point] }
    expect(validateBlockContent('recruiter_cta', five).ok).toBe(false)
    const none = { ...content, points: [] }
    expect(validateBlockContent('recruiter_cta', none).ok).toBe(false)
  })

  it('lets the CV be absent but never the inbox', () => {
    const settings = definition.defaults.settings as Record<string, unknown>
    expect(validateBlockSettings('recruiter_cta', { ...settings, cvHref: '' }).ok).toBe(true)
    expect(validateBlockSettings('recruiter_cta', { ...settings, email: '' }).ok).toBe(false)
  })
})
