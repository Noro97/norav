import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter-tight/900.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './i18n'
import App from './App'
import { reportWebVitals } from '@/lib/webVitals'
import './index.css'
import '@warmbros/warmbros-components/styles.css'

// Register GSAP plugins once
gsap.registerPlugin(ScrollTrigger)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Core Web Vitals: logs to the console in dev, no-op in prod unless configured.
reportWebVitals()
