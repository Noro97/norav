import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionObserver } from '@/hooks/useScrollProgress'
import type { MerchConfig } from '@/types'

gsap.registerPlugin(ScrollTrigger)

const PRODUCT_TYPES = ['T-Shirt', 'Hoodie', 'Mug', 'Poster', 'Sticker Pack']
const COLORS = [
  { name: 'Midnight Black', hex: '#1a1a1a' },
  { name: 'Arctic White', hex: '#f0f0f0' },
  { name: 'Crimson Red', hex: '#B51A2B' },
  { name: 'Navy Blue', hex: '#1e3a5f' },
  { name: 'Forest Green', hex: '#2d5a3d' },
]
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const BASE_PRICES: Record<string, number> = {
  'T-Shirt': 29.99,
  'Hoodie': 59.99,
  'Mug': 14.99,
  'Poster': 24.99,
  'Sticker Pack': 9.99,
}

const DEFAULT_CONFIG: MerchConfig = {
  productType: 'T-Shirt',
  color: 'Midnight Black',
  size: 'M',
  text: 'Hello World',
  quantity: 1,
  premium: false,
}

function generateSKU(config: MerchConfig): string {
  const type = config.productType.replace(/\s/g, '').slice(0, 3).toUpperCase()
  const color = config.color.split(' ').map((w) => w[0]).join('').toUpperCase()
  const size = config.size
  return `MF-${type}-${color}-${size}-${config.premium ? 'P' : 'S'}`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function syntaxHighlight(json: string): string {
  const safe = escapeHtml(json)
  return safe
    .replace(/(&quot;.*?&quot;)\s*:/g, '<span class="text-crimson-400">$1</span>:')
    .replace(/:\s*(&quot;.*?&quot;)/g, ': <span class="text-emerald-400">$1</span>')
    .replace(/:\s*(true)/g, ': <span class="text-yellow-400">$1</span>')
    .replace(/:\s*(false)/g, ': <span class="text-white/30">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-sky-400">$1</span>')
}

export function AIMerchWidget() {
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('merch', sectionRef)
  const jsonRef = useRef<HTMLPreElement>(null)
  const [config, setConfig] = useState<MerchConfig>(DEFAULT_CONFIG)
  const [displayedJson, setDisplayedJson] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [changeCount, setChangeCount] = useState(0)

  // Computed output with derived fields
  const fullOutput = useMemo(() => {
    const basePrice = BASE_PRICES[config.productType] ?? 29.99
    const premiumMultiplier = config.premium ? 1.4 : 1.0
    const unitPrice = Math.round(basePrice * premiumMultiplier * 100) / 100
    const total = Math.round(unitPrice * config.quantity * 100) / 100

    return {
      product: {
        type: config.productType,
        color: config.color,
        size: config.size,
        customText: config.text,
      },
      options: {
        premium: config.premium,
        quantity: config.quantity,
      },
      pricing: {
        unitPrice,
        total,
        currency: 'USD',
      },
      meta: {
        sku: generateSKU(config),
        estimatedDays: config.premium ? 3 : 7,
        inStock: true,
      },
    }
  }, [config])

  // GSAP entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.merch-left', {
        opacity: 0, x: -40, duration: 0.8,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })
      gsap.from('.merch-right', {
        opacity: 0, x: 40, duration: 0.8,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  // Typing animation
  useEffect(() => {
    const fullJson = JSON.stringify(fullOutput, null, 2)
    setIsTyping(true)

    let idx = 0
    const interval = setInterval(() => {
      idx += 4
      if (idx >= fullJson.length) {
        idx = fullJson.length
        clearInterval(interval)
        setIsTyping(false)
      }
      setDisplayedJson(fullJson.slice(0, idx))
    }, 6)

    return () => clearInterval(interval)
  }, [fullOutput])

  const updateConfig = useCallback(
    <K extends keyof MerchConfig>(key: K, value: MerchConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }))
      setChangeCount((c) => c + 1)
    },
    []
  )

  const activeColor = COLORS.find((c) => c.name === config.color)

  return (
    <section
      id="merch"
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="label-mono">Case Study 02</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3">
            MerchForge
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mt-4">
            AI-powered merchandise designer with real-time state synchronization.
            Every UI interaction instantly reflects in the live configuration output.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['React State', 'JSON Sync', 'Derived Data', 'Typing Animation'].map((t) => (
              <span key={t} className="px-2 py-1 text-[10px] font-mono text-white/30 border border-white/8 rounded">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-white/8">
          {/* Left — UI Constructor */}
          <div className="merch-left bg-white/[0.02] p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-crimson-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <div className="w-3 h-3 rounded-full bg-green-500/40" />
              <span className="ml-3 font-mono text-xs text-white/30">constructor.ui</span>
              <span className="ml-auto font-mono text-[10px] text-white/20">{changeCount} changes</span>
            </div>

            {/* Product Type */}
            <div>
              <label className="block font-mono text-[10px] text-white/40 mb-2 tracking-wider uppercase">
                Product Type
              </label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => updateConfig('productType', type)}
                    className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${
                      config.productType === type
                        ? 'border-crimson-500 bg-crimson-500/10 text-crimson-400'
                        : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block font-mono text-[10px] text-white/40 mb-2 tracking-wider uppercase">
                Color
              </label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => updateConfig('color', c.name)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      config.color === c.name
                        ? 'border-crimson-500 scale-110'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-white/25 mt-1 block">{config.color}</span>
            </div>

            {/* Size */}
            <div>
              <label className="block font-mono text-[10px] text-white/40 mb-2 tracking-wider uppercase">
                Size
              </label>
              <div className="flex gap-1.5">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateConfig('size', s)}
                    className={`w-10 h-10 text-xs font-mono rounded border transition-all ${
                      config.size === s
                        ? 'border-crimson-500 bg-crimson-500/10 text-crimson-400'
                        : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text */}
            <div>
              <label className="block font-mono text-[10px] text-white/40 mb-2 tracking-wider uppercase">
                Custom Text
              </label>
              <input
                type="text"
                value={config.text}
                onChange={(e) => updateConfig('text', e.target.value)}
                maxLength={30}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white/80 font-mono focus:outline-none focus:border-crimson-500/50 transition-colors"
                placeholder="Enter your text..."
              />
              <span className="font-mono text-[10px] text-white/15 mt-1 block">{config.text.length}/30</span>
            </div>

            {/* Quantity + Premium */}
            <div className="flex items-end gap-6">
              <div>
                <label className="block font-mono text-[10px] text-white/40 mb-2 tracking-wider uppercase">
                  Quantity
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateConfig('quantity', Math.max(1, config.quantity - 1))}
                    className="w-9 h-9 rounded border border-white/10 text-white/40 font-mono text-sm hover:border-white/20 transition-colors"
                  >
                    −
                  </button>
                  <span className="font-mono text-white/80 w-10 text-center text-lg">{config.quantity}</span>
                  <button
                    onClick={() => updateConfig('quantity', Math.min(99, config.quantity + 1))}
                    className="w-9 h-9 rounded border border-white/10 text-white/40 font-mono text-sm hover:border-white/20 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-white/40 mb-2 tracking-wider uppercase">
                  Premium
                </label>
                <button
                  onClick={() => updateConfig('premium', !config.premium)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.premium ? 'bg-crimson-500' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                      config.premium ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Price preview */}
              <div className="ml-auto text-right">
                <span className="font-mono text-[10px] text-white/30 block">Total</span>
                <span className="font-mono text-xl text-crimson-400 font-bold">
                  ${(fullOutput.pricing.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* SKU preview */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <div
                className="w-8 h-8 rounded border border-white/10 shrink-0"
                style={{ backgroundColor: activeColor?.hex ?? '#1a1a1a' }}
              />
              <div>
                <span className="font-mono text-[10px] text-white/30 block">SKU</span>
                <span className="font-mono text-xs text-white/60">{generateSKU(config)}</span>
              </div>
              <div className="ml-auto">
                <span className="font-mono text-[10px] text-white/30 block">Delivery</span>
                <span className="font-mono text-xs text-white/60">{config.premium ? '3 days' : '7 days'}</span>
              </div>
            </div>
          </div>

          {/* Right — Live JSON */}
          <div className="merch-right bg-[#08080f] p-6 md:p-8 border-l border-white/5 relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500/40" />
              <span className="font-mono text-xs text-white/30">output.json</span>
              <span
                className={`ml-auto font-mono text-[10px] tracking-wider uppercase ${
                  isTyping ? 'text-crimson-400' : 'text-green-400/50'
                }`}
              >
                {isTyping ? 'syncing...' : 'live'}
              </span>
            </div>

            <pre
              ref={jsonRef}
              className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words overflow-auto max-h-[500px]"
              dangerouslySetInnerHTML={{
                __html:
                  syntaxHighlight(displayedJson) +
                  (isTyping ? '<span class="animate-pulse text-crimson-400">|</span>' : ''),
              }}
            />

            {/* Line numbers gutter effect */}
            <div className="absolute left-0 top-14 bottom-0 w-8 bg-gradient-to-r from-white/[0.01] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  )
}
