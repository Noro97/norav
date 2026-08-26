import { query } from './db'

/** Append-only trail. Never throws: an audit failure must not fail the request. */
export async function audit(entry: {
  actorId?: string | null
  action: string
  entityType?: string | null
  entityId?: string | null
  diff?: unknown
  ip?: string | null
}): Promise<void> {
  try {
    await query(
      `insert into audit_log (actor_id, action, entity_type, entity_id, diff, ip)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        entry.actorId ?? null,
        entry.action,
        entry.entityType ?? null,
        entry.entityId ?? null,
        entry.diff === undefined ? null : JSON.stringify(entry.diff),
        entry.ip ?? null,
      ],
    )
  } catch (error) {
    console.error('[audit] failed to record', entry.action, error)
  }
}
