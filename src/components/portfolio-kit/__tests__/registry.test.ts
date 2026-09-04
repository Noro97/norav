import { describe, expect, it } from 'vitest'
import { PORTFOLIO_SECTION_OPTIONS, portfolioSectionVariant } from '@norav/content-schema'
import { PORTFOLIO_KIT } from '../registry'

/**
 * The dropdown and the enum live in the schema package, where the CMS can read
 * them; the components live here, where it cannot. Nothing links the two at
 * compile time, so an editor could otherwise pick a section this deployment has
 * no code for and get an empty page section with a console warning.
 */
describe('the kit registry and the CMS agree on what exists', () => {
  const known = portfolioSectionVariant.options
  const rendered = Object.keys(PORTFOLIO_KIT).sort()

  it('renders every section the block can be set to', () => {
    // The enum, not the dropdown: a section promoted to its own block leaves the
    // dropdown but keeps rendering for blocks already placed.
    expect(known.filter((value) => !(value in PORTFOLIO_KIT))).toEqual([])
  })

  it('knows every section it can render', () => {
    const values = new Set<string>(known)
    expect(rendered.filter((key) => !values.has(key))).toEqual([])
  })

  it('imported all 53 of them', () => {
    expect(rendered).toHaveLength(53)
  })

  it('only offers sections that have not been promoted', () => {
    const offered = new Set(PORTFOLIO_SECTION_OPTIONS.map((option) => option.value))
    expect(offered.size).toBeLessThan(known.length)
    expect([...offered].every((value) => known.includes(value as (typeof known)[number]))).toBe(true)
  })

  it('labels each offered section once', () => {
    const labels = PORTFOLIO_SECTION_OPTIONS.map((option) => option.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})
