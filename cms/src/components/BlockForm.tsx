'use client'

import type { FormField } from '@norav/content-schema'

/**
 * Renders the editor for one block from its form descriptor.
 *
 * Nothing here knows what a hero is. A new block type ships by adding its
 * definition to the registry — the admin picks it up from `GET /api/admin/schema`.
 */

export type FieldSource = 'content' | 'settings'

export interface BlockFormProps {
  fields: FormField[]
  content: Record<string, unknown>
  settings: Record<string, unknown>
  /** Field paths (as returned by the API) that failed validation. */
  errors?: Record<string, string>
  disabled?: boolean
  onChange: (source: FieldSource, path: string, value: unknown) => void
}

function getPath(target: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value === null || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, target)
}

export function setPath<T>(target: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.')
  if (head === undefined) return value as T

  const isIndex = /^\d+$/.test(head)
  if (isIndex) {
    const list = Array.isArray(target) ? [...(target as unknown[])] : []
    const index = Number(head)
    list[index] = rest.length === 0 ? value : setPath(list[index], rest.join('.'), value)
    return list as unknown as T
  }

  const source = (target ?? {}) as Record<string, unknown>
  return {
    ...source,
    [head]: rest.length === 0 ? value : setPath(source[head], rest.join('.'), value),
  } as T
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
  const root = source === 'content' ? form.content : form.settings
  const value = getPath(root, path)
  const error = form.errors?.[path]
  const id = `${source}-${path}`

  if (field.control === 'group') {
    return (
      <fieldset>
        <legend>{field.label}</legend>
        {field.help && <p className="help" style={{ marginTop: 0 }}>{field.help}</p>}
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
        {field.help && <p className="help" style={{ marginTop: 0 }}>{field.help}</p>}

        {rows.map((row, index) => (
          <div className="row" key={index}>
            <div className="row-head">
              <span className="index">{String(index + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {field.itemLabel ? String(getPath(row, field.itemLabel) ?? '') : ''}
              </span>
              <span className="spacer" />
              <button type="button" onClick={() => move(index, index - 1)} disabled={form.disabled || index === 0} aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(index, index + 1)} disabled={form.disabled || index === rows.length - 1} aria-label="Move down">↓</button>
              <button
                type="button"
                onClick={() => form.onChange(source, path, rows.filter((_, i) => i !== index))}
                disabled={form.disabled || !canRemove}
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
          disabled={form.disabled || !canAdd}
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
          disabled={form.disabled}
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
          disabled={form.disabled}
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
          disabled={form.disabled}
          onChange={(e) => form.onChange(source, path, e.target.value)}
        />
      ) : field.control === 'number' ? (
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={String(value ?? '')}
          disabled={form.disabled}
          onChange={(e) => form.onChange(source, path, Number(e.target.value))}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={String(value ?? '')}
          placeholder={field.placeholder}
          disabled={form.disabled}
          onChange={(e) => form.onChange(source, path, e.target.value)}
        />
      )}

      {field.help && <p className="help">{field.help}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
