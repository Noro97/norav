import type { Metric } from 'web-vitals'

/**
 * Core Web Vitals reporting (google/web-vitals).
 *
 * Dev  — loads the `attribution` build and logs each metric to the console
 *        together with the element/interaction that caused it.
 * Prod — stays completely out of the bundle unless a sink is configured
 *        (VITE_WEB_VITALS_ENDPOINT or an explicit onReport callback), so the
 *        default production build pays nothing for this.
 *
 * Both paths are dynamically imported, keeping web-vitals off the critical path.
 */

/** A metric from the attribution build; `attribution` is absent on the standard build. */
type AttributedMetric = Metric & { attribution?: object }

export type WebVitalsReporter = (metric: AttributedMetric) => void

const RATING_COLOR: Record<Metric['rating'], string> = {
  good: '#22c55e',
  'needs-improvement': '#f59e0b',
  poor: '#ef4444',
}

/** The single most useful "what caused this" field per metric. */
const CULPRIT_KEY: Partial<Record<Metric['name'], string>> = {
  LCP: 'target',
  CLS: 'largestShiftTarget',
  INP: 'interactionTarget',
}

/** CLS is a unitless score; every other vital is milliseconds. */
function formatValue(metric: Metric): string {
  return metric.name === 'CLS' ? metric.value.toFixed(3) : `${Math.round(metric.value)} ms`
}

function logMetric(metric: AttributedMetric): void {
  const color = RATING_COLOR[metric.rating]
  const attribution = metric.attribution as Record<string, unknown> | undefined
  const culpritKey = CULPRIT_KEY[metric.name]
  const culprit = culpritKey && attribution ? attribution[culpritKey] : undefined

  console.groupCollapsed(
    `%c${metric.name}%c ${formatValue(metric)} %c${metric.rating}`,
    `color:${color};font-weight:700`,
    'color:inherit;font-weight:600',
    `color:${color}`,
  )
  if (culprit) console.log(`caused by (${culpritKey}):`, culprit)
  if (attribution) console.log('attribution:', attribution)
  console.log('metric:', metric)
  console.groupEnd()
}

/** Ship a metric to an endpoint; sendBeacon survives page unload, fetch is the fallback. */
function beacon(endpoint: string, metric: AttributedMetric): void {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    path: location.pathname,
  })

  if (navigator.sendBeacon?.(endpoint, body)) return
  void fetch(endpoint, { body, method: 'POST', keepalive: true }).catch(() => {})
}

/**
 * Start collecting Core Web Vitals (LCP, CLS, INP, FCP, TTFB).
 * Safe to call once at startup; each callback fires when its metric is final.
 */
export function reportWebVitals(onReport?: WebVitalsReporter): void {
  if (import.meta.env.DEV) {
    void import('web-vitals/attribution').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      const handler = (metric: AttributedMetric) => {
        logMetric(metric)
        onReport?.(metric)
      }
      onCLS(handler)
      onFCP(handler)
      onINP(handler)
      onLCP(handler)
      onTTFB(handler)
    })
    return
  }

  const endpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT
  if (!endpoint && !onReport) return

  void import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
    const handler = (metric: AttributedMetric) => {
      if (endpoint) beacon(endpoint, metric)
      onReport?.(metric)
    }
    onCLS(handler)
    onFCP(handler)
    onINP(handler)
    onLCP(handler)
    onTTFB(handler)
  })
}
