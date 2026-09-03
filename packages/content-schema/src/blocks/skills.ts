import { z } from 'zod'
import { defineBlock } from '../define-block'
import { SECTION_HEADER_FIELDS, sectionHeader } from './shared'

/**
 * Skill names, levels and years are the same in every language — only the
 * category names and the surrounding copy are translated.
 */
const content = sectionHeader.extend({
  proficiencyOverview: z.string().max(80),
  skillsTracked: z.string().max(80),
  categories: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        skills: z
          .array(
            z.object({
              name: z.string().min(1).max(60),
              level: z.number().int().min(0).max(100),
              years: z.number().int().min(0).max(50),
            }),
          )
          .min(1)
          .max(12),
      }),
    )
    .min(1)
    .max(8),
})

const settings = z.object({ showCounters: z.boolean().default(true) })

export const skillsBlock = defineBlock({
  type: 'skills',
  label: 'Skills',
  tier: 1,
  singleton: true,
  description: 'Proficiency matrix grouped into categories.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Expertise',
      title: 'Skills & Tools',
      description: '',
      proficiencyOverview: 'Proficiency Overview',
      skillsTracked: '{{count}} skills tracked',
      categories: [
        { name: 'Frontend Core', skills: [{ name: 'React.js', level: 95, years: 7 }] },
      ],
    },
    settings: { showCounters: true },
  },
  form: [
    ...SECTION_HEADER_FIELDS,
    {
      field: 'showCounters',
      control: 'boolean',
      label: 'Animate skill percentages',
      source: 'settings',
      localized: false,
    },
    { field: 'proficiencyOverview', control: 'text', label: 'Chart heading' },
    {
      field: 'skillsTracked',
      control: 'text',
      label: 'Counter template',
      help: 'Use {{count}} for the number of skills.',
    },
    {
      field: 'categories',
      control: 'repeater',
      label: 'Categories',
      itemLabel: 'name',
      min: 1,
      max: 8,
      fields: [
        { field: 'name', control: 'text', label: 'Category' },
        {
          field: 'skills',
          control: 'repeater',
          label: 'Skills',
          itemLabel: 'name',
          min: 1,
          max: 12,
          fields: [
            { field: 'name', control: 'text', label: 'Skill', localized: false },
            { field: 'level', control: 'number', label: 'Level (0-100)', localized: false },
            { field: 'years', control: 'number', label: 'Years', localized: false },
          ],
        },
      ],
    },
  ],
})

export type SkillsContent = z.infer<typeof content>
export type SkillsSettings = z.infer<typeof settings>
