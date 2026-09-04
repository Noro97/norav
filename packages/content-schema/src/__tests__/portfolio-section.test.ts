import { describe, expect, it } from 'vitest'
import { portfolioSectionBlock, PORTFOLIO_SECTION_OPTIONS } from '../blocks/portfolio-section'
import { validateBlockContent, validateBlockSettings } from '../blocks'

describe('portfolio_section', () => {
  it('creates from its defaults', () => {
    const { content, settings } = portfolioSectionBlock.defaults
    expect(validateBlockContent('portfolio_section', content).ok).toBe(true)
    expect(validateBlockSettings('portfolio_section', settings).ok).toBe(true)
  })

  it('accepts every section the dropdown offers', () => {
    for (const option of PORTFOLIO_SECTION_OPTIONS) {
      const result = validateBlockSettings('portfolio_section', {
        variant: option.value,
        accent: '#123abc',
      })
      expect(result.ok, option.value).toBe(true)
    }
  })

  it('refuses a section that does not exist', () => {
    // The value is a module name under `src/components/portfolio-kit/sections`;
    // anything else publishes a page section that renders nothing.
    const result = validateBlockSettings('portfolio_section', {
      variant: 'not-a-section',
      accent: '#123abc',
    })
    expect(result.ok).toBe(false)
  })

  it('reads an empty accent as "follow the site theme"', () => {
    // The default, and what almost every section should carry: the accent then
    // comes from the published palette instead of being frozen at import time.
    expect(validateBlockSettings('portfolio_section', { variant: 'faq', accent: '' }).ok).toBe(true)
    expect(portfolioSectionBlock.defaults.settings.accent).toBe('')
  })

  it('refuses an accent that is neither empty nor a six-digit hex', () => {
    // It is handed to the sections as an inline `background`/`color`, so a
    // malformed value is silently dropped by the browser rather than reported.
    for (const accent of ['crimson', '#fff', 'B51A2B', '#B51A2BB']) {
      expect(validateBlockSettings('portfolio_section', { variant: 'faq', accent }).ok, accent).toBe(false)
    }
  })

  it('carries no copy of its own', () => {
    // The sections arrived with their text baked in. An empty content schema is
    // the honest description of that — better than fields no editor can use.
    expect(portfolioSectionBlock.defaults.content).toEqual({})
    expect(portfolioSectionBlock.form.every((field) => field.source === 'settings')).toBe(true)
  })
})
