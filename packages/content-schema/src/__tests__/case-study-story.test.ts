import { describe, expect, it } from 'vitest'
import { getBlockDefinition, validateBlockContent } from '../blocks'

const definition = getBlockDefinition('case_study')!
const figure = { image: 'media:x', alt: 'What it shows' }

describe('the case_study block', () => {
  it('can be placed more than once, once per study', () => {
    expect(definition.singleton).toBe(false)
  })

  it('accepts its own empty defaults, so a study can start blank', () => {
    expect(validateBlockContent('case_study', definition.defaults.content).ok).toBe(true)
    expect(validateBlockContent('case_study', {}).ok).toBe(true)
  })

  it('fills what is missing, so the site can read every part', () => {
    const result = validateBlockContent('case_study', { title: 'Nova Prism' })
    expect(result.ok && result.data).toEqual({ ...(definition.defaults.content as object), title: 'Nova Prism' })
  })

  it('needs an image and alt text on every figure, so a clip always has a poster', () => {
    expect(validateBlockContent('case_study', { figures: [figure] }).ok).toBe(true)
    expect(validateBlockContent('case_study', { figures: [{ ...figure, video: 'media:y' }] }).ok).toBe(true)
    expect(validateBlockContent('case_study', { figures: [{ alt: 'No poster', video: 'media:y' }] }).ok).toBe(false)
    expect(validateBlockContent('case_study', { figures: [{ image: 'media:x', alt: '' }] }).ok).toBe(false)
  })

  it('refuses a decision with only half of it written', () => {
    expect(validateBlockContent('case_study', { decisions: [{ title: 'A heading', body: '' }] }).ok).toBe(false)
  })

  it('has a form input for every field', () => {
    const inForm = definition.form.map((field) => field.field).sort()
    expect(inForm).toEqual(Object.keys(definition.defaults.content as object).sort())
  })

  it('marks the video field, so the picker offers videos there and not images', () => {
    const fields = definition.form.find((field) => field.field === 'figures')!.fields!
    expect(fields.find((field) => field.field === 'video')!.accept).toBe('video')
    expect(fields.find((field) => field.field === 'image')!.accept).toBeUndefined()
  })
})
