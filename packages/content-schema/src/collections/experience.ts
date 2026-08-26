import { z } from 'zod'
import { defineCollection } from '../define-collection'

const data = z.object({
  period: z.string().min(1).max(60),
  stack: z.array(z.object({ name: z.string().min(1).max(40) })).max(12),
  image: z.string().max(200),
})

const content = z.object({
  role: z.string().min(1).max(120),
  company: z.string().min(1).max(80),
  type: z.string().max(40),
  description: z.string().min(1).max(600),
  achievements: z.array(z.object({ text: z.string().min(1).max(400) })).max(8),
})

export const experienceCollection = defineCollection({
  key: 'experience',
  label: 'Experience',
  description: 'Roles in the career timeline, newest first.',
  titleField: 'company',
  data,
  content,
  defaults: {
    data: { period: '', stack: [], image: '' },
    content: { role: '', company: '', type: '', description: '', achievements: [] },
  },
  form: [
    { field: 'role', control: 'text', label: 'Role' },
    { field: 'company', control: 'text', label: 'Company' },
    { field: 'type', control: 'text', label: 'Arrangement', help: 'Remote, On-site, Founder…' },
    { field: 'period', control: 'text', label: 'Period', source: 'data' },
    { field: 'description', control: 'textarea', label: 'Summary' },
    {
      field: 'achievements',
      control: 'repeater',
      label: 'Achievements',
      itemLabel: 'text',
      max: 8,
      fields: [{ field: 'text', control: 'textarea', label: 'Achievement' }],
    },
    {
      field: 'stack',
      control: 'repeater',
      label: 'Stack',
      itemLabel: 'name',
      max: 12,
      source: 'data',
      fields: [{ field: 'name', control: 'text', label: 'Technology' }],
    },
    { field: 'image', control: 'media', label: 'Image', source: 'data' },
  ],
})

export type ExperienceData = z.infer<typeof data>
export type ExperienceContent = z.infer<typeof content>
