import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import baked from '@/content/snapshot.en.json'
import { profileOf } from '../profile'
import { renderShell } from '../shell-metadata'

const PROFILE = profileOf(baked.settings)
const shell = readFileSync(resolve(__dirname, '../../../index.html'), 'utf8')

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html')
const content = (doc: Document, selector: string) => doc.querySelector(selector)?.getAttribute('content')

describe('renderShell', () => {
  it('fills every placeholder index.html has', () => {
    expect(renderShell(shell, PROFILE)).not.toMatch(/%PROFILE_/)
  })

  it('says what the live site says today, with the published profile missing', () => {
    const doc = parse(renderShell(shell, PROFILE))

    expect(doc.title).toBe('Norayr Avetisyan — Senior Fullstack Engineer')
    expect(content(doc, 'meta[name="author"]')).toBe('Norayr Avetisyan')
    expect(content(doc, 'meta[property="og:site_name"]')).toBe('Norayr Avetisyan')
    expect(content(doc, 'meta[property="og:title"]')).toBe('Norayr Avetisyan — Senior Fullstack Engineer')
    expect(content(doc, 'meta[name="twitter:title"]')).toBe('Norayr Avetisyan — Senior Fullstack Engineer')
    // The site description in facts.md since S5 (version 28).
    const description =
      'Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js. Interfaces at scale, and the systems under them.'
    expect(content(doc, 'meta[name="description"]')).toBe(description)
    expect(content(doc, 'meta[property="og:description"]')).toBe(description)
    expect(content(doc, 'meta[name="twitter:description"]')).toBe(description)
  })

  it('writes the JSON-LD from the profile', () => {
    const doc = parse(renderShell(shell, PROFILE))
    const person = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!)

    expect(person).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Norayr Avetisyan',
      jobTitle: 'Senior Fullstack Engineer',
      url: 'https://norav.dev',
      email: 'noroavetisyan@gmail.com',
      sameAs: ['https://github.com/Noro97', 'https://www.linkedin.com/in/norayravetisyan/', 'https://t.me/antarber'],
      knowsAbout: ['React', 'Next.js', 'TypeScript', 'Vue.js', 'Design Systems', 'Micro-frontends', 'Storybook', 'Telegram Mini Apps'],
      knowsLanguage: ['Armenian', 'Russian', 'English'],
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Armenian State University of Economics' },
      address: { '@type': 'PostalAddress', addressLocality: 'Yerevan', addressCountry: 'AM' },
    })
  })

  it('follows the published profile, and leaves out an empty link', () => {
    const doc = parse(
      renderShell(shell, {
        ...PROFILE,
        jobTitle: 'Engineer',
        links: { ...PROFILE.links, telegram: '' },
      }),
    )
    const person = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!)

    expect(doc.title).toBe('Norayr Avetisyan — Engineer')
    expect(person.jobTitle).toBe('Engineer')
    expect(person.sameAs).toHaveLength(2)
  })

  it('keeps a value inside the tag it was written into', () => {
    const html = renderShell(shell, {
      ...PROFILE,
      description: 'Quotes " and <tags> & $& stay text',
      name: '</script><img src=x>',
    })
    const doc = parse(html)

    expect(content(doc, 'meta[name="description"]')).toBe('Quotes " and <tags> & $& stay text')
    expect(doc.querySelector('img')).toBeNull()
    expect(JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!).name).toBe('</script><img src=x>')
  })
})
