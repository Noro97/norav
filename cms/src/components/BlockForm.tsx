'use client'

import type { FormField, Locale } from '@norav/content-schema'
import { useState } from 'react'
import { getAtPath } from '@norav/content-schema'
import { usePages } from './PagesContext'
import { MediaPicker } from './MediaPicker'
import { mediaDisplaySrc, mediaRefId, toMediaRef } from '@/lib/media-refs'
import { Modal } from './Modal'

/**
 * Renders the editor for one block from its form descriptor.
 *
 * Nothing here knows what a hero is. A new block type ships by adding its
 * definition to the registry — the admin picks it up from `GET /api/admin/schema`.
 */

export type FieldSource = 'content' | 'settings' | 'data'

export interface BlockFormProps {
  fields: FormField[]
  content: Record<string, unknown>
  settings: Record<string, unknown>
  /** Non-localized row data. Collections only; blocks keep theirs in settings. */
  data?: Record<string, unknown>
  /** Field paths (as returned by the API) that failed validation. */
  errors?: Record<string, string>
  disabled?: boolean
  locale: Locale
  sourceLocale: Locale
  onChange: (source: FieldSource, path: string, value: unknown) => void
}

function blankRow(fields: FormField[]): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const field of fields) {
    row[field.field] =
      field.control === 'boolean'
        ? false
        : field.control === 'select'
          ? (field.options?.[0]?.value ?? '')
          : // A nested list starts empty, not as an empty string: `''` renders
            // no rows either way, but it is the wrong type, so the row fails
            // validation on save until someone adds a child to it.
            field.control === 'repeater'
            ? []
            : field.control === 'group'
              ? blankRow(field.fields ?? [])
              : ''
  }
  return row
}

export function BlockForm(props: BlockFormProps) {
  return (
    <div>
      {props.fields.map((field) => (
        <Field key={`${field.source ?? 'content'}:${field.field}`} field={field} prefix="" {...props} />
      ))}
    </div>
  )
}

interface FieldProps extends BlockFormProps {
  field: FormField
  prefix: string
}

function Field({ field, prefix, ...form }: FieldProps) {
  const { pages } = usePages()
  const source: FieldSource = field.source ?? 'content'
  const path = prefix ? `${prefix}.${field.field}` : field.field
  const root =
    source === 'settings' ? form.settings : source === 'data' ? (form.data ?? {}) : form.content
  const value = getAtPath(root, path)
  const error = form.errors?.[path]
  const id = `${source}-${path}`

  // A value that is the same in every language is owned by the source locale.
  // Showing it as editable here would invite a change that is silently dropped
  // on save, so it is read-only with a note about where it lives.
  const inherited = field.localized === false && form.locale !== form.sourceLocale
  const disabled = form.disabled || inherited
  const help = inherited ? `Edited in ${form.sourceLocale.toUpperCase()}` : field.help

  if (field.control === 'media') {
    return (
      <MediaField
        id={id}
        label={field.label}
        help={help}
        value={typeof value === 'string' ? value : ''}
        disabled={disabled}
        error={error}
        onChange={(next) => form.onChange(source, path, next)}
      />
    )
  }

  if (field.control === 'collection') {
    return (
      <div className="field">
        <label>{field.label}</label>
        <p className="help" style={{ marginTop: 0 }}>
          {field.help ?? `Rows live in the "${field.collection}" collection.`}
        </p>
      </div>
    )
  }

  if (field.control === 'group') {
    return (
      <fieldset>
        <legend>{field.label}</legend>
        {help && <p className="help" style={{ marginTop: 0 }}>{help}</p>}
        {(field.fields ?? []).map((child) => (
          <Field key={child.field} field={{ ...child, source }} prefix={path} {...form} />
        ))}
      </fieldset>
    )
  }

  if (field.control === 'repeater') {
    const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : []
    const children = field.fields ?? []
    const canRemove = rows.length > (field.min ?? 0)
    const canAdd = rows.length < (field.max ?? Infinity)

    const move = (from: number, to: number) => {
      if (to < 0 || to >= rows.length) return
      const next = [...rows]
      const [moved] = next.splice(from, 1)
      if (moved) next.splice(to, 0, moved)
      form.onChange(source, path, next)
    }

    return (
      <RepeaterField
        legend={field.label}
        help={help}
        rows={rows}
        itemLabel={field.itemLabel}
        mediaFields={children.filter((child) => child.control === 'media').map((child) => child.field)}
        disabled={disabled}
        canAdd={canAdd}
        canRemove={canRemove}
        onMove={move}
        onRemove={(index) => form.onChange(source, path, rows.filter((_, i) => i !== index))}
        onAdd={() => form.onChange(source, path, [...rows, blankRow(children)])}
        renderFields={(index) =>
          children.map((child) => (
            <Field key={child.field} field={{ ...child, source }} prefix={`${path}.${index}`} {...form} />
          ))
        }
      />
    )
  }

  if (field.control === 'boolean') {
    return (
      <div className="field checkbox">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          disabled={disabled}
          onChange={(e) => form.onChange(source, path, e.target.checked)}
        />
        <label htmlFor={id}>{field.label}</label>
        {error && <span className="error">{error}</span>}
      </div>
    )
  }

  return (
    <div className="field">
      <label htmlFor={id}>{field.label}</label>

      {field.control === 'page' ? (
        // The pages that exist, rather than a URL typed by hand. A menu item
        // stores the slug and the site derives the address, so this is the
        // whole of what makes renaming a page safe.
        <select
          id={id}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(e) => form.onChange(source, path, e.target.value)}
        >
          {pages.map((page) => (
            <option key={page.slug} value={page.slug}>
              /{page.slug === 'home' ? '' : page.slug}
            </option>
          ))}
        </select>
      ) : field.control === 'select' ? (
        <select
          id={id}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(e) => form.onChange(source, path, e.target.value)}
        >
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.control === 'textarea' ? (
        <textarea
          id={id}
          rows={4}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(e) => form.onChange(source, path, e.target.value)}
        />
      ) : field.control === 'number' ? (
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(e) => form.onChange(source, path, Number(e.target.value))}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={String(value ?? '')}
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(e) => form.onChange(source, path, e.target.value)}
        />
      )}

      {help && <p className="help">{help}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}

/**
 * An image field: a thumbnail, the reference it holds, and the library behind
 * a button. Choosing stores `media:<id>`; the value stays editable by hand —
 * the images that predate the media library live in the site's public folder
 * and are referenced by path.
 */
function MediaField({
  id,
  label,
  help,
  value,
  disabled,
  error,
  onChange,
}: {
  id: string
  label: string
  help?: string
  value: string
  disabled?: boolean
  error?: string
  onChange: (next: string) => void
}) {
  const [picking, setPicking] = useState(false)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      <div className="media-field">
        {value ? <img src={mediaDisplaySrc(value)} alt="" /> : null}
        <input
          id={id}
          type="text"
          className="path"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <button type="button" className="ghost" disabled={disabled} onClick={() => setPicking(true)}>
          Choose
        </button>
      </div>

      {help && <p className="help">{help}</p>}
      {error && <p className="error">{error}</p>}

      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onSelect={(item) => {
            // The entry, not where its bytes are today — see lib/media-refs.
            onChange(toMediaRef(item.id))
            setPicking(false)
          }}
        />
      )}
    </div>
  )
}

/**
 * A repeater as a list of rows, opened one at a time.
 *
 * Every row used to be expanded at once. That was fine for four principles and
 * unreadable for the bento grid, which is now five projects and five tiles each
 * carrying an illustration — a single column hundreds of pixels long where
 * finding one tile means scrolling past the others.
 *
 * Collapsed, a row shows what identifies it and what it looks like. Editing
 * happens in a dialog, so the list stays where it was when you close it.
 */
function RepeaterField({
  legend,
  help,
  rows,
  itemLabel,
  mediaFields,
  disabled,
  canAdd,
  canRemove,
  onMove,
  onRemove,
  onAdd,
  renderFields,
}: {
  legend: string
  help?: string
  rows: Record<string, unknown>[]
  itemLabel?: string
  /** The row's image fields. Only these make a thumbnail — a link is a URL too. */
  mediaFields: string[]
  disabled?: boolean
  canAdd: boolean
  canRemove: boolean
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  onAdd: () => void
  renderFields: (index: number) => React.ReactNode
}) {
  const [editing, setEditing] = useState<number | null>(null)

  /**
   * The first image in a row, if it has one — what the row looks like. Read
   * from the fields declared as media, not from any string that looks like a
   * URL: that guess drew a social link's profile address as a broken image.
   */
  const thumbnail = (row: Record<string, unknown>): string | null => {
    for (const value of mediaFields.map((field) => row[field])) {
      if (mediaRefId(value)) return mediaDisplaySrc(value as string)
      if (typeof value === 'string' && /^https?:\/\//.test(value) && !/\.pdf$/i.test(value)) {
        return value
      }
    }
    return null
  }

  const label = (row: Record<string, unknown>, index: number) =>
    (itemLabel ? String(getAtPath(row, itemLabel) ?? '') : '') || `Item ${index + 1}`

  return (
    <fieldset>
      <legend>{legend}</legend>
      {help && (
        <p className="help" style={{ marginTop: 0 }}>
          {help}
        </p>
      )}

      <div className="repeat-rows">
        {rows.map((row, index) => {
          const image = thumbnail(row)
          return (
            <div className="repeat-row" key={index}>
              <span className="index">{String(index + 1).padStart(2, '0')}</span>
              {image ? (
                <img className="repeat-thumb" src={image} alt="" loading="lazy" />
              ) : (
                <span className="repeat-thumb repeat-thumb-empty" aria-hidden="true" />
              )}
              <button
                type="button"
                className="repeat-open"
                disabled={disabled}
                onClick={() => setEditing(index)}
              >
                {label(row, index)}
              </button>
              <button
                type="button"
                onClick={() => onMove(index, index - 1)}
                disabled={disabled || index === 0}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(index, index + 1)}
                disabled={disabled || index === rows.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={disabled || !canRemove}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        className="ghost"
        style={{ marginBottom: 16 }}
        disabled={disabled || !canAdd}
        onClick={() => {
          onAdd()
          setEditing(rows.length)
        }}
      >
        + Add
      </button>

      {editing !== null && rows[editing] && (
        <Modal title={`${legend} — ${label(rows[editing], editing)}`} onClose={() => setEditing(null)}>
          {renderFields(editing)}
        </Modal>
      )}
    </fieldset>
  )
}
