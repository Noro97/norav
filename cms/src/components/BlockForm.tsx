'use client'

import type { FormField, Locale } from '@norav/content-schema'
import { useState } from 'react'
import { getAtPath } from '@norav/content-schema'
import { MediaPicker } from './MediaPicker'

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
      field.control === 'boolean' ? false : field.control === 'select' ? field.options?.[0]?.value ?? '' : ''
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
      <fieldset>
        <legend>{field.label}</legend>
        {help && <p className="help" style={{ marginTop: 0 }}>{help}</p>}

        {rows.map((row, index) => (
          <div className="row" key={index}>
            <div className="row-head">
              <span className="index">{String(index + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {field.itemLabel ? String(getAtPath(row, field.itemLabel) ?? '') : ''}
              </span>
              <span className="spacer" />
              <button type="button" onClick={() => move(index, index - 1)} disabled={disabled || index === 0} aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(index, index + 1)} disabled={disabled || index === rows.length - 1} aria-label="Move down">↓</button>
              <button
                type="button"
                onClick={() => form.onChange(source, path, rows.filter((_, i) => i !== index))}
                disabled={disabled || !canRemove}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
            {children.map((child) => (
              <Field key={child.field} field={{ ...child, source }} prefix={`${path}.${index}`} {...form} />
            ))}
          </div>
        ))}

        <button
          type="button"
          className="ghost"
          style={{ marginBottom: 16 }}
          disabled={disabled || !canAdd}
          onClick={() => form.onChange(source, path, [...rows, blankRow(children)])}
        >
          + Add
        </button>
      </fieldset>
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

      {field.control === 'select' ? (
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
 * An image field: a thumbnail, the path it points at, and the library behind a
 * button. The path stays editable by hand — the images that predate the media
 * library live in the site's public folder and are referenced by path.
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
        {value ? <img src={value} alt="" /> : null}
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
            onChange(item.url)
            setPicking(false)
          }}
        />
      )}
    </div>
  )
}
