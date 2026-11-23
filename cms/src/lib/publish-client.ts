import type { Feedback } from '@/components/Workspace'

/**
 * The Publish button, in whichever editor it sits.
 *
 * Five editors had their own copy of this. A restore adds a question that has
 * to be asked in all of them: the site shows an older version, the drafts
 * weren't restored, and publishing puts the drafts back. The server refuses
 * until it's been asked, so a copy that forgot couldn't publish over a restore
 * by accident.
 */
export async function publishFromAdmin(): Promise<{ ok: boolean; feedback: Feedback }> {
  let replaceRestore = false

  for (;;) {
    const response = await fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replaceRestore ? { replaceRestore } : {}),
    })
    const body = await response.json().catch(() => null)

    if (response.status === 409 && body?.error?.code === 'restore_live' && !replaceRestore) {
      if (!window.confirm(`${body.error.message}\n\nPublish the drafts anyway?`)) {
        return { ok: false, feedback: { kind: 'warn', message: 'Not published. The site still shows the restore.' } }
      }
      replaceRestore = true
      continue
    }

    if (!response.ok) {
      return {
        ok: false,
        feedback: {
          kind: 'err',
          message: body?.error?.message ?? 'Publish failed.',
          details: body?.error?.fields?.map((f: { path: string; message: string }) => `${f.path} — ${f.message}`),
        },
      }
    }

    return {
      ok: true,
      feedback: body.data.unchanged
        ? { kind: 'warn', message: `Nothing changed since version ${body.data.version}.` }
        : { kind: 'ok', message: `Published version ${body.data.version}.` },
    }
  }
}
