/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_GOOGLE_MAPS_MAP_ID: string
  /** Optional sink for Core Web Vitals in production; unset = reporting disabled. */
  readonly VITE_WEB_VITALS_ENDPOINT?: string
}

declare module '*.glsl' {
  const value: string
  export default value
}

declare module '*.vert' {
  const value: string
  export default value
}

declare module '*.frag' {
  const value: string
  export default value
}
