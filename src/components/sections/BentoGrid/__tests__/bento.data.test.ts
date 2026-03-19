import { describe, it, expect } from 'vitest'
import { BENTO_PROJECTS, BENTO_METRICS, MICRO_TILES, OMNIGRID_PROJECT, PROOF_PROJECT } from '../bento.data'

describe('bento.data integrity', () => {
  it('has at least 3 projects', () => {
    expect(BENTO_PROJECTS.length).toBeGreaterThanOrEqual(3)
  })

  it('projects have required fields', () => {
    for (const project of BENTO_PROJECTS) {
      expect(project.id).toBeTruthy()
      expect(project.titleKey).toBeTruthy()
      expect(project.descriptionKey).toBeTruthy()
      expect(project.ctaKey).toBeTruthy()
      expect(project.techStack).toBeDefined()
      expect(Array.isArray(project.techStack)).toBe(true)
      expect(project.techStack.length).toBeGreaterThan(0)
      expect(project.variant).toBeTruthy()
    }
  })

  it('has micro tiles with index and icon', () => {
    expect(MICRO_TILES.length).toBeGreaterThan(0)
    for (const tile of MICRO_TILES) {
      expect(tile.index).toBeDefined()
      expect(tile.icon).toBeTruthy()
    }
  })

  it('has bento metrics with required fields', () => {
    expect(BENTO_METRICS.length).toBeGreaterThan(0)
    for (const metric of BENTO_METRICS) {
      expect(metric.key).toBeTruthy()
      expect(metric.value).toBeDefined()
      expect(metric.labelKey).toBeTruthy()
      expect(metric.color).toBeTruthy()
    }
  })

  it('has OmniGrid project definition', () => {
    expect(OMNIGRID_PROJECT.id).toBe('omnigrid')
    expect(OMNIGRID_PROJECT.techStack.length).toBeGreaterThan(0)
  })

  it('has Proof project definition', () => {
    expect(PROOF_PROJECT.id).toBe('proof')
    expect(PROOF_PROJECT.techStack.length).toBeGreaterThan(0)
  })
})
