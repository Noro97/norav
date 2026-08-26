import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'

/**
 * scrypt from node:crypto — no native module to build, nothing to keep patched.
 * Format: scrypt$N$r$p$salt$hash, so the cost parameters travel with the hash
 * and can be raised later without invalidating existing accounts.
 */
const N = 2 ** 15
const r = 8
const p = 1
const KEY_LENGTH = 64
const MAX_MEMORY = 256 * 1024 * 1024

function derive(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, keyLength, options, (error, key) => {
      if (error) reject(error)
      else resolve(key)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt, KEY_LENGTH, { N, r, p, maxmem: MAX_MEMORY })
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts as [
    string,
    string,
    string,
    string,
    string,
    string,
  ]
  const expected = Buffer.from(hashRaw, 'base64')
  const key = await derive(password, Buffer.from(saltRaw, 'base64'), expected.length, {
    N: Number(nRaw),
    r: Number(rRaw),
    p: Number(pRaw),
    maxmem: MAX_MEMORY,
  })

  return key.length === expected.length && timingSafeEqual(key, expected)
}
