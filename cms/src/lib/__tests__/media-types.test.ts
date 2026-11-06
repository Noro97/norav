import { describe, expect, it } from 'vitest'
import {
  directUploadTarget,
  FUNCTION_BODY_BYTES,
  goesDirect,
  MAX_FILE_BYTES,
  MAX_VIDEO_BYTES,
  maxBytesFor,
  uploadProblem,
} from '../media-types'

const UUID = '0b4f6c1e-8d2a-4c3b-9e5f-1a2b3c4d5e6f'
const MB = 1024 * 1024

describe('what the library accepts', () => {
  it('takes video, up to its own limit', () => {
    expect(uploadProblem('video/mp4', MAX_VIDEO_BYTES)).toBeNull()
    expect(uploadProblem('video/webm', 1)).toBeNull()
    expect(uploadProblem('video/mp4', MAX_VIDEO_BYTES + 1)).toMatchObject({ status: 413, code: 'too_large' })
  })

  it('holds images and documents to 12 MB', () => {
    expect(uploadProblem('image/png', MAX_FILE_BYTES)).toBeNull()
    expect(uploadProblem('application/pdf', MAX_FILE_BYTES + 1)).toMatchObject({ status: 413 })
  })

  it('holds an SVG to what a function can read, because a function has to read it', () => {
    expect(maxBytesFor('image/svg+xml')).toBe(FUNCTION_BODY_BYTES)
    expect(uploadProblem('image/svg+xml', FUNCTION_BODY_BYTES + 1)).toMatchObject({ status: 413 })
  })

  it('refuses anything else, naming it', () => {
    expect(uploadProblem('video/quicktime', 1)).toMatchObject({ status: 415, message: expect.stringContaining('quicktime') })
    expect(uploadProblem('', 1)).toMatchObject({ status: 415 })
  })
})

describe('which way a file travels', () => {
  it('goes through the function on the embedded setup, whatever its size', () => {
    expect(goesDirect('video/mp4', 40 * MB, 'local')).toBe(false)
    expect(goesDirect('image/png', 10 * MB, 'local')).toBe(false)
  })

  it('goes direct when it is a video, or too big for a function', () => {
    expect(goesDirect('video/mp4', 1, 'blob')).toBe(true)
    expect(goesDirect('image/png', FUNCTION_BODY_BYTES + 1, 'blob')).toBe(true)
    expect(goesDirect('application/pdf', 5 * MB, 'blob')).toBe(true)
  })

  it('stays with the function when small, and always for an SVG', () => {
    expect(goesDirect('image/png', FUNCTION_BODY_BYTES, 'blob')).toBe(false)
    expect(goesDirect('image/svg+xml', 1, 'blob')).toBe(false)
  })
})

describe('where a direct upload may land', () => {
  it('derives the type and limit from the pathname, not from what the browser claims', () => {
    expect(directUploadTarget(`media/${UUID}.mp4`)).toEqual({
      key: `${UUID}.mp4`,
      mime: 'video/mp4',
      maxBytes: MAX_VIDEO_BYTES,
    })
    expect(directUploadTarget(`media/${UUID}.png`)).toMatchObject({ mime: 'image/png', maxBytes: MAX_FILE_BYTES })
  })

  it.each([
    ['outside the media folder', `other/${UUID}.mp4`],
    ['a name the server would not have chosen', 'media/holiday.mp4'],
    ['a path that climbs out', `media/../${UUID}.mp4`],
    ['a type it does not accept', `media/${UUID}.exe`],
    ['an SVG, which has to be checked first', `media/${UUID}.svg`],
  ])('refuses %s', (_name, pathname) => {
    expect(directUploadTarget(pathname)).toBeNull()
  })
})
