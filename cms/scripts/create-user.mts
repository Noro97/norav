/**
 * Creates (or re-passwords) an admin account. There is no public sign-up.
 *
 *   npm run user:add -- --email you@example.com --password 'correct horse battery staple'
 *
 * Omit --password to be prompted for it.
 */
import { createInterface } from 'node:readline/promises'
import { query, queryOne } from '../src/lib/db'
import { hashPassword } from '../src/lib/password'

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
}

const email = arg('email')
if (!email) {
  console.error('Usage: npm run user:add -- --email you@example.com [--password ...] [--role owner|editor]')
  process.exit(1)
}

let password = arg('password')
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  password = await rl.question(`Password for ${email}: `)
  rl.close()
}
if (password.length < 12) {
  console.error('Use at least 12 characters — this account can edit the live site.')
  process.exit(1)
}

const role = arg('role') ?? 'owner'
const hash = await hashPassword(password)

const existing = await queryOne<{ id: string }>(
  `select id from admin_users where lower(email) = lower($1)`,
  [email],
)

if (existing) {
  await query(`update admin_users set password_hash = $2, is_active = true where id = $1`, [
    existing.id,
    hash,
  ])
  // Any session opened with the old password stops working immediately.
  await query(`update sessions set revoked_at = now() where user_id = $1 and revoked_at is null`, [
    existing.id,
  ])
  console.log(`Password updated for ${email}; existing sessions revoked.`)
} else {
  await query(`insert into admin_users (email, password_hash, role) values ($1, $2, $3)`, [
    email,
    hash,
    role,
  ])
  console.log(`Created ${role} ${email}.`)
}

process.exit(0)
