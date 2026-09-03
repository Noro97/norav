import { z } from 'zod'
import { defineBlock } from '../define-block'
import { GALLERY_STYLE_OPTIONS, SECTION_HEADER_FIELDS, galleryStyle, sectionHeader } from './shared'

/**
 * A gallery as a section in its own right.
 *
 * The case studies already carry one, but only as an addition to their demo —
 * bolted to the bottom of a widget and reachable only there. A page that wants
 * nothing but pictures had no way to say so, so this is the same
 * `GalleryVariant` with its own block: not a singleton, because the reason to
 * have it at all is to use it more than once.
 */
const content = sectionHeader.extend({
  images: z
    .array(
      z.object({
        image: z.string().default(''),
        /** What the picture shows, for anyone who cannot see it. Copy, so translated. */
        alt: z.string().max(160).default(''),
      }),
    )
    .min(1)
    .max(12),
})

const settings = z.object({ galleryStyle: galleryStyle.default('grid') })

export const galleryBlock = defineBlock({
  type: 'gallery',
  label: 'Gallery',
  tier: 1,
  singleton: false,
  description: 'A set of images in the arrangement you pick: grid, circle, dome or a swapping stack.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Gallery',
      title: 'Selected shots',
      description: '',
      images: [{ image: '', alt: '' }],
    },
    settings: { galleryStyle: 'grid' },
  },
  form: [
    ...SECTION_HEADER_FIELDS,
    {
      field: 'images',
      control: 'repeater',
      label: 'Images',
      itemLabel: 'alt',
      min: 1,
      max: 12,
      fields: [
        { field: 'image', control: 'media', label: 'Image', localized: false },
        { field: 'alt', control: 'text', label: 'Alt text' },
      ],
    },
    {
      field: 'galleryStyle',
      control: 'select',
      label: 'Arrangement',
      source: 'settings',
      localized: false,
      options: GALLERY_STYLE_OPTIONS,
    },
  ],
})

export type GalleryContent = z.infer<typeof content>
export type GallerySettings = z.infer<typeof settings>
