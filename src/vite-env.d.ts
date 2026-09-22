/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_GOOGLE_MAPS_MAP_ID: string
  /** Optional sink for Core Web Vitals in production; unset = reporting disabled. */
  readonly VITE_WEB_VITALS_ENDPOINT?: string
  /**
   * Origin of the CMS (https://cms.norav.dev). Unset = the site renders the
   * snapshot baked into the bundle and never calls out.
   */
  readonly VITE_CMS_URL?: string
}
