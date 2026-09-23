import { describe, expect, it } from 'vitest'
import { inspectSvg } from '../svg'

const svg = (attrs: string, body = '<path d="M0 0h1v1z"/>') =>
  Buffer.from(`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${attrs}>${body}</svg>`)

describe('inspectSvg', () => {
  it('accepts what an illustration tool exports, namespaces and all', () => {
    expect(inspectSvg(svg('width="1024" height="1024" viewBox="0 0 1024 1024"'))).toEqual({
      width: 1024,
      height: 1024,
    })
  })

  it('falls back to the viewBox when the size is relative or missing', () => {
    expect(inspectSvg(svg('width="100%" viewBox="213.04 340.99 454.49 544.64"'))).toEqual({
      width: 454,
      height: 545,
    })
    expect(inspectSvg(svg(''))).toEqual({ width: null, height: null })
  })

  it('keeps embedded raster images and in-document links', () => {
    const body = '<use xlink:href="#a"/><image href="data:image/png;base64,AAAA"/>'
    expect(inspectSvg(svg('viewBox="0 0 10 10"', body)).problem).toBeUndefined()
  })

  it.each([
    ['<script>alert(1)</script>', 'script'],
    ['<rect onload="alert(1)"/>', 'event handler'],
    ['<a href="javascript:alert(1)"><rect/></a>', 'javascript:'],
    ['<image href="data:image/svg+xml;base64,AAAA"/>', 'data:'],
    ['<image href="https://tracker.example/pixel.png"/>', 'another site'],
    ['<foreignObject><div/></foreignObject>', 'foreignObject'],
  ])('refuses %s', (body, named) => {
    expect(inspectSvg(svg('viewBox="0 0 10 10"', body)).problem).toContain(named)
  })

  it('refuses a file that is not an SVG at all', () => {
    expect(inspectSvg(Buffer.from('<html></html>')).problem).toMatch(/<svg>/)
  })
})
