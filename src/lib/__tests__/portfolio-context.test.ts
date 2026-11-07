import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import baked from '@/content/snapshot.en.json'
import { buildPortfolioContext } from '../portfolio-context'
import { bareUrl, profileOf, wrapWords } from '../profile'

const PROFILE = profileOf(baked.settings)

describe('buildPortfolioContext', () => {
  const prompt = buildPortfolioContext(PROFILE)

  it('holds the identity from facts.md', () => {
    for (const fact of [
      'Name: Norayr Avetisyan',
      'Role: Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js',
      '8+ years in JavaScript and TypeScript, since August 2018',
      'Yerevan, Armenia (UTC+4). Remote, EU/US overlap',
      'noroavetisyan@gmail.com',
      'Armenian (native), Russian (fluent), English (professional)',
      'BSc Computer Science, Armenian State University of Economics',
    ]) {
      expect(prompt).toContain(fact)
    }
  })

  it('holds every role and the numbers approved for it, in order', () => {
    const order = PROFILE.roles.map(({ company, role }) => prompt.indexOf(`${role} @ ${company}`))
    expect(order.every((position) => position > 0)).toBe(true)
    expect(order).toEqual([...order].sort((a, b) => a - b))

    for (const { highlights } of PROFILE.roles) {
      for (const { text } of highlights) expect(prompt).toContain(text)
    }
    expect(prompt).toContain('It has not been in production')
    expect(prompt).toContain('LCP 4.1s to 1.3s')
  })

  it('says the demos are demos', () => {
    expect(prompt).toContain('They are not shipped client or employer work')
  })

  it('answers from whatever the profile says, not a copy of its own', () => {
    const edited = buildPortfolioContext({ ...PROFILE, name: 'Someone Else', availability: 'Not looking' })
    expect(edited).toContain('Name: Someone Else')
    expect(edited).toContain('Status: Not looking')
    expect(edited).not.toContain('Norayr')
  })
})

describe('the helpers the terminal prints with', () => {
  it('writes a link the way a person would', () => {
    expect(bareUrl('https://www.linkedin.com/in/norayravetisyan/')).toBe('linkedin.com/in/norayravetisyan')
    expect(bareUrl('https://t.me/antarber')).toBe('t.me/antarber')
  })

  it('breaks lines between words', () => {
    expect(wrapWords('Currently open to senior fullstack roles at remote EU/US product companies.', 40)).toEqual([
      'Currently open to senior fullstack roles',
      'at remote EU/US product companies.',
    ])
    expect(wrapWords('', 40)).toEqual([])
  })
})

describe('the prompt /api/chat sends', () => {
  const published = { settings: { profile: { ...PROFILE, availability: 'Published just now' } } }

  /** Answers the CMS with `cms`, and records what Anthropic was sent. */
  function stubNetwork(cms: () => Promise<Response>) {
    const sent: { system: string }[] = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/api/public/content')) return cms()
      sent.push(JSON.parse(String(init?.body)))
      return new Response(new ReadableStream({ start: (controller) => controller.close() }))
    })
    vi.stubGlobal('fetch', fetchMock)
    return { sent, fetchMock }
  }

  async function ask() {
    vi.resetModules()
    const { handleChat } = await import('../../../server/chat')
    const request = () =>
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
      })
    return { handleChat, request }
  }

  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
    vi.stubEnv('CMS_URL', 'https://cms.example/')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('comes from what the CMS publishes now', async () => {
    const { sent, fetchMock } = stubNetwork(async () => Response.json(published))
    const { handleChat, request } = await ask()

    await handleChat(request(), '1.1.1.1')

    expect(sent[0]!.system).toContain('Status: Published just now')
    expect(fetchMock.mock.calls[0]![0]).toBe('https://cms.example/api/public/content?locale=en')
  })

  it('asks the CMS once, then reuses the answer', async () => {
    const { sent, fetchMock } = stubNetwork(async () => Response.json(published))
    const { handleChat, request } = await ask()

    await handleChat(request(), '2.2.2.2')
    await handleChat(request(), '2.2.2.2')

    expect(sent).toHaveLength(2)
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/public/content'))).toHaveLength(1)
  })

  it.each([
    ['is down', async () => Promise.reject(new Error('refused'))],
    ['answers with an error', async () => new Response('nope', { status: 500 })],
    ['has published no profile yet', async () => Response.json({ settings: {} })],
  ])('still answers when the CMS %s', async (_name, cms) => {
    const { sent } = stubNetwork(cms)
    const { handleChat, request } = await ask()

    const response = await handleChat(request(), '3.3.3.3')

    expect(response.status).toBe(200)
    expect(sent[0]!.system).toContain('Name: Norayr Avetisyan')
  })

  it('does not call the CMS for a request it refuses', async () => {
    const { fetchMock } = stubNetwork(async () => Response.json(published))
    const { handleChat } = await ask()

    const response = await handleChat(
      new Request('http://localhost/api/chat', { method: 'POST', body: JSON.stringify({ messages: [] }) }),
      '4.4.4.4',
    )

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
