import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The shared schema is consumed as TypeScript source, like app code.
  transpilePackages: ['@norav/content-schema'],
  // Native/WASM database drivers must not be bundled.
  serverExternalPackages: ['pg', '@electric-sql/pglite'],
  // The repo root, so file tracing keeps ../db/migrations and ../packages.
  outputFileTracingRoot: path.join(process.cwd(), '..'),
  poweredByHeader: false,
}

export default nextConfig
