import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import '@fontsource/inter-tight/latin-900.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-600.css'
import './i18n'
import App from './App'
import { ContentProvider } from '@/content/ContentProvider'
import { BAKED_SNAPSHOTS } from '@/content'
import { applyTheme, applyRememberedTheme } from '@/content/theme'
import { reportWebVitals } from '@/lib/webVitals'
import './index.css'

// Both before the first render. The bundle's palette is as new as the last
// deploy; the remembered one is as new as the last visit, and wins when it is
// newer — which is what keeps a reload from flashing the previous colours on
// the way to the current ones.
applyTheme(BAKED_SNAPSHOTS.en.settings)
applyRememberedTheme(BAKED_SNAPSHOTS.en.version)

const app = (
  <StrictMode>
    <BrowserRouter>
      <ContentProvider>
        <App />
      </ContentProvider>
    </BrowserRouter>
  </StrictMode>
)

// Only hydrate markup written for this address. 404.html answers any path it doesn't
// know, and that path may be a page published since this build, so there the browser
// renders from scratch.
const root = document.getElementById('root')!
const here = window.location.pathname.replace(/(.)\/$/, '$1')
if (root.dataset.prerendered === here) hydrateRoot(root, app)
else createRoot(root).render(app)

// Core Web Vitals: logs to the console in dev, no-op in prod unless configured.
reportWebVitals()
