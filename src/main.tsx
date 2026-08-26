import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter-tight/900.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './i18n'
import App from './App'
import { ContentProvider } from '@/content/ContentProvider'
import { BAKED_SNAPSHOTS } from '@/content'
import { applyTheme } from '@/content/theme'
import { reportWebVitals } from '@/lib/webVitals'
import './index.css'
import '@warmbros/warmbros-components/styles.css'

// Register GSAP plugins once
gsap.registerPlugin(ScrollTrigger)

// Before the first render, so the published palette is the only one ever painted.
applyTheme(BAKED_SNAPSHOTS.en.settings)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>,
)

// Core Web Vitals: logs to the console in dev, no-op in prod unless configured.
reportWebVitals()
