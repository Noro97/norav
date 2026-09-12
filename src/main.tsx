import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { MotionConfig } from 'framer-motion'
import '@fontsource/inter-tight/900.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './i18n'
import App from './App'
import { ContentProvider } from '@/content/ContentProvider'
import { BAKED_SNAPSHOTS } from '@/content'
import { applyTheme, applyRememberedTheme } from '@/content/theme'
import { reportWebVitals } from '@/lib/webVitals'
import './index.css'
import '@warmbros/warmbros-components/styles.css'

// Register GSAP plugins once
gsap.registerPlugin(ScrollTrigger)

// Both before the first render. The bundle's palette is as new as the last
// deploy; the remembered one is as new as the last visit, and wins when it is
// newer — which is what keeps a reload from flashing the previous colours on
// the way to the current ones.
applyTheme(BAKED_SNAPSHOTS.en.settings)
applyRememberedTheme(BAKED_SNAPSHOTS.en.version)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* `user`: when the OS asks for less motion, Framer keeps the opacity
          animations and drops the transforms — a slide becomes a cross-fade,
          which is what reduced motion means, not no feedback. This is the
          one switch every motion.* on the site answers to. */}
      <MotionConfig reducedMotion="user">
        <ContentProvider>
          <App />
        </ContentProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)

// Core Web Vitals: logs to the console in dev, no-op in prod unless configured.
reportWebVitals()
