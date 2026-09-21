import { describe, expect, it } from 'vitest'
import { getBlockDefinition, validateBlockContent, validateBlockSettings } from '../blocks'

describe('the footer', () => {
  const definition = getBlockDefinition('site_footer')!

  it('is one per site, owned by the CMS', () => {
    expect(definition.singleton).toBe(true)
    expect(definition.tier).toBe(1)
  })

  it('ships defaults that publish as they are', () => {
    expect(validateBlockContent('site_footer', definition.defaults.content).ok).toBe(true)
    expect(validateBlockSettings('site_footer', definition.defaults.settings).ok).toBe(true)
  })

  it('carries no page links — those come from the navigation collection', () => {
    const fields = definition.form.map((field) => field.field)
    expect(fields).not.toContain('links')
    expect(fields).not.toContain('pages')
  })

  it('needs an inbox', () => {
    expect(validateBlockSettings('site_footer', { email: '' }).ok).toBe(false)
  })
})
