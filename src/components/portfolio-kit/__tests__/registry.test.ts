import { describe, expect, it } from 'vitest'
import { PORTFOLIO_SECTION_OPTIONS } from '@norav/content-schema'
import { PORTFOLIO_KIT } from '../registry'

/**
 * The dropdown lives in the schema package, where the CMS can read it; the
 * components live here, where the CMS cannot. Nothing links the two at compile
 * time, so an editor could otherwise pick a section this deployment has no code
 * for, and get an empty page section with a console warning.
 */
describe('the kit registry and the CMS dropdown describe the same sections', () => {
  const offered = PORTFOLIO_SECTION_OPTIONS.map((option) => option.value).sort()
  const rendered = Object.keys(PORTFOLIO_KIT).sort()

  it('renders every section the CMS offers', () => {
    expect(offered.filter((value) => !(value in PORTFOLIO_KIT))).toEqual([])
  })

  it('offers every section it can render', () => {
    const values = new Set(offered)
    expect(rendered.filter((key) => !values.has(key))).toEqual([])
  })

  it('imported all 53 of them', () => {
    expect(rendered).toHaveLength(53)
  })

  it('labels each one once', () => {
    const labels = PORTFOLIO_SECTION_OPTIONS.map((option) => option.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})
