import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Coffee, Image as ImageIcon, Shirt, Sticker, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useBlock } from '@/content/ContentProvider'
import { CHOSEN, UNCHOSEN } from '@/components/ui/selection'
import { useCaseStudyLabel } from '@/content/case-studies'
import { GalleryVariant } from '@/components/ui/effects/GalleryVariant'
import type { CaseStudyContent, CaseStudySettings } from '@norav/content-schema'
import type { MerchConfig } from '@/types'

const PRODUCT_TYPE_KEYS = [
  'merch.products.tshirt',
  'merch.products.hoodie',
  'merch.products.mug',
  'merch.products.poster',
  'merch.products.stickerPack',
] as const

const PRODUCT_TYPE_VALUES = ['T-Shirt', 'Hoodie', 'Mug', 'Poster', 'Sticker Pack']

const COLOR_KEYS = [
  'merch.colors.midnightBlack',
  'merch.colors.arcticWhite',
  'merch.colors.crimsonRed',
  'merch.colors.navyBlue',
  'merch.colors.forestGreen',
] as const

const COLOR_VALUES = ['Midnight Black', 'Arctic White', 'Crimson Red', 'Navy Blue', 'Forest Green']
// What the garment is dyed, not what the site is themed. A sweep that replaced
// hardcoded brand hexes with the accent token caught this one too, and the
// swatch labelled "Crimson Red" turned green when the palette did — while its
// neighbours, navy and forest, stayed put. Muted to sit with them.
// Garment colours — what the product comes in, not what the site paints with.
// eslint-disable-next-line no-restricted-syntax -- content, not the palette
const COLOR_HEXES = ['#1a1a1a', '#f0f0f0', '#7d1f2b', '#1e3a5f', '#2d5a3d']

/**
 * What each product actually is. Sizes used to be one list of garment sizes
 * shown for all five, so a mug was offered in XS through XXL and its SKU came
 * out as MF-MUG-MB-M-S — a medium mug.
 *
 * The icon stands in for a photograph. The one here was a T-shirt from
 * Unsplash: a third-party request in the middle of a case study about a
 * configurator, and a T-shirt no matter which product was selected.
 */
const PRODUCTS: Record<
  string,
  { price: number; sizes: string[]; defaultSize: string; Icon: LucideIcon }
> = {
  'T-Shirt': { price: 29.99, sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], defaultSize: 'M', Icon: Shirt },
  'Hoodie': { price: 59.99, sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], defaultSize: 'L', Icon: Shirt },
  'Mug': { price: 14.99, sizes: ['11oz', '15oz'], defaultSize: '11oz', Icon: Coffee },
  'Poster': { price: 24.99, sizes: ['A3', 'A2', 'A1'], defaultSize: 'A2', Icon: ImageIcon },
  'Sticker Pack': { price: 9.99, sizes: ['S', 'M', 'L'], defaultSize: 'M', Icon: Sticker },
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
  const size = config.size.toUpperCase()
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
    .replace(/(&quot;.*?&quot;)\s*:/g, '<span class="text-primary-400">$1</span>:')
    .replace(/:\s*(&quot;.*?&quot;)/g, ': <span class="text-secondary-400">$1</span>')
    .replace(/:\s*(true)/g, ': <span class="text-primary-300">$1</span>')
    .replace(/:\s*(false)/g, ': <span class="text-tertiary-ink/45">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-secondary-300">$1</span>')
}

export function AIMerchWidget({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<CaseStudyContent, CaseStudySettings>('merch')
  // Before the early return: the number is a hook, and a hook cannot sit
  // behind a conditional.
  const sectionLabel = useCaseStudyLabel('merch', block?.content.sectionLabel ?? '')
  const { t } = useTranslation(['projects', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'merch', sectionRef)
  const jsonRef = useRef<HTMLPreElement>(null)
  const [config, setConfig] = useState<MerchConfig>(DEFAULT_CONFIG)
  const [displayedJson, setDisplayedJson] = useState('')
  const [changeCount, setChangeCount] = useState(0)

  // Computed output with derived fields
  const fullOutput = useMemo(() => {
    const basePrice = PRODUCTS[config.productType]?.price ?? 29.99
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
  useGSAP(() => {
    const left = sectionRef.current!.querySelector('.merch-left')
    const right = sectionRef.current!.querySelector('.merch-right')
    if (left) {
      gsap.fromTo(left,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
    if (right) {
      gsap.fromTo(right,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
  }, { scope: sectionRef })

  // Typing animation — isTyping is derived from the typed length instead of
  // being set synchronously inside the effect.
  const fullJson = useMemo(() => JSON.stringify(fullOutput, null, 2), [fullOutput])
  const isTyping = displayedJson !== fullJson

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      idx = Math.min(idx + 4, fullJson.length)
      if (idx >= fullJson.length) clearInterval(interval)
      setDisplayedJson(fullJson.slice(0, idx))
    }, 6)

    return () => clearInterval(interval)
  }, [fullJson])

  const updateConfig = useCallback(
    <K extends keyof MerchConfig>(key: K, value: MerchConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }))
      setChangeCount((c) => c + 1)
    },
    []
  )

  /**
   * Switching product is not an edit to a configuration, it is a different
   * configuration — so it does not add to the count, and it carries the size
   * across only when the new product has one by that name. A T-shirt in M
   * becoming a mug in M was how "medium mug" got into the SKU.
   */
  const selectProduct = useCallback((productType: string) => {
    setConfig((prev) => {
      const product = PRODUCTS[productType]
      if (!product) return { ...prev, productType }
      return {
        ...prev,
        productType,
        size: product.sizes.includes(prev.size) ? prev.size : product.defaultSize,
      }
    })
  }, [])

  const sizes = PRODUCTS[config.productType]?.sizes ?? []
  const ProductIcon = PRODUCTS[config.productType]?.Icon ?? Shirt
  const activeColorIdx = COLOR_VALUES.indexOf(config.color)
  const activeHex = activeColorIdx >= 0 ? COLOR_HEXES[activeColorIdx] : '#1a1a1a'

  if (!block) return null
  const { content, settings } = block
  const screenshots = content.screenshots.map((s) => s.image).filter(Boolean)

  return (
    <section
      id={anchorId ?? 'merch'}
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-gutter-x py-24"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="label-mono">{sectionLabel}</span>
          <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3">
            {content.title}
          </h2>
          <p className="text-tertiary-ink/50 text-body-large max-w-2xl mt-4">
            {content.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {content.techStack.map((tag) => (
              <span key={tag.name} className="case-study-pill text-caption font-mono text-tertiary-ink/45">
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="case-study-card grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          {/* Left — UI Constructor */}
          <div className="merch-left bg-tertiary-ink/[0.02] p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary-500/60" />
              <div className="w-3 h-3 rounded-full bg-tertiary-ink/15" />
              <div className="w-3 h-3 rounded-full bg-tertiary-ink/10" />
              <span className="ml-3 font-mono text-caption text-tertiary-ink/45">constructor.ui</span>
              <span className="ml-auto font-mono text-caption text-tertiary-ink/40">{changeCount} {t('common:labels.changes')}</span>
            </div>

            {/* Product Type */}
            <div>
              <label className="type-label block text-tertiary-ink/40 mb-2">
                {t('projects:merch.labels.productType')}
              </label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_TYPE_VALUES.map((type, i) => (
                  <button
                    key={type}
                    onClick={() => selectProduct(type)}
                    className={`px-3 py-1.5 text-caption font-mono rounded border transition-all ${
                      config.productType === type ? CHOSEN : UNCHOSEN
                    }`}
                  >
                    {t(`projects:${PRODUCT_TYPE_KEYS[i]}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="type-label block text-tertiary-ink/40 mb-2">
                {t('projects:merch.labels.color')}
              </label>
              <div className="flex gap-2">
                {COLOR_VALUES.map((colorName, i) => (
                  <button
                    key={colorName}
                    onClick={() => updateConfig('color', colorName)}
                    title={t(`projects:${COLOR_KEYS[i]}`)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      config.color === colorName
                        ? 'border-secondary-500 scale-110'
                        : 'border-tertiary-ink/10 hover:border-tertiary-ink/30'
                    }`}
                    style={{ backgroundColor: COLOR_HEXES[i] }}
                  />
                ))}
              </div>
              <span className="font-mono text-caption text-tertiary-ink/40 mt-1 block">
                {t(`projects:${COLOR_KEYS[COLOR_VALUES.indexOf(config.color)]}`)}
              </span>
            </div>

            {/* Size */}
            <div>
              <label className="type-label block text-tertiary-ink/40 mb-2">
                {t('projects:merch.labels.size')}
              </label>
              <div className="flex gap-1.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateConfig('size', s)}
                    className={`h-10 min-w-10 px-2 text-caption font-mono rounded border transition-all ${
                      config.size === s ? CHOSEN : UNCHOSEN
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text */}
            <div>
              <label className="type-label block text-tertiary-ink/40 mb-2">
                {t('projects:merch.labels.customText')}
              </label>
              <input
                type="text"
                value={config.text}
                onChange={(e) => updateConfig('text', e.target.value)}
                maxLength={30}
                className="w-full bg-tertiary-ink/5 border border-tertiary-ink/10 rounded px-3 py-2 text-body-small text-tertiary-ink/80 font-mono focus:outline-none focus:border-primary-500/50 transition-colors"
                placeholder={t('projects:merch.placeholder.enterText')}
              />
              <span className="font-mono text-caption text-tertiary-ink/35 mt-1 block">{config.text.length}/30</span>
            </div>

            {/* Quantity + Premium */}
            <div className="flex items-end gap-6">
              <div>
                <label className="type-label block text-tertiary-ink/40 mb-2">
                  {t('projects:merch.labels.quantity')}
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateConfig('quantity', Math.max(1, config.quantity - 1))}
                    className="w-9 h-9 rounded border border-tertiary-ink/10 text-tertiary-ink/40 font-mono text-body-small hover:border-tertiary-ink/20 transition-colors"
                  >
                    −
                  </button>
                  <span className="font-mono text-tertiary-ink/80 w-10 text-center text-body-large">{config.quantity}</span>
                  <button
                    onClick={() => updateConfig('quantity', Math.min(99, config.quantity + 1))}
                    className="w-9 h-9 rounded border border-tertiary-ink/10 text-tertiary-ink/40 font-mono text-body-small hover:border-tertiary-ink/20 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="type-label block text-tertiary-ink/40 mb-2">
                  {t('projects:merch.labels.premium')}
                </label>
                <button
                  onClick={() => updateConfig('premium', !config.premium)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    config.premium ? 'bg-primary-500' : 'bg-tertiary-ink/10'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-tertiary-ink transition-all duration-200 ${
                      config.premium ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Price preview */}
              <div className="ml-auto text-right">
                <span className="type-label text-secondary-300 block">{t('common:labels.total')}</span>
                <span className="font-mono text-heading-small text-secondary-300 font-black">
                  ${(fullOutput.pricing.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* SKU preview */}
            <div className="flex items-center gap-3 pt-2 border-t border-tertiary-ink/5">
              <div className="w-12 h-12 rounded-lg border border-tertiary-ink/10 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundColor: activeHex }} />
                <ProductIcon
                  className="absolute inset-0 m-auto w-6 h-6 text-tertiary-ink/80 mix-blend-difference"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
              <div>
                <span className="font-mono text-caption text-tertiary-ink/45 block">{t('common:labels.sku')}</span>
                <span className="font-mono text-caption text-tertiary-ink/60">{generateSKU(config)}</span>
              </div>
              <div className="ml-auto">
                <span className="font-mono text-caption text-tertiary-ink/45 block">{t('common:labels.delivery')}</span>
                <span className="font-mono text-caption text-tertiary-ink/60">{config.premium ? t('projects:merch.delivery.days3') : t('projects:merch.delivery.days7')}</span>
              </div>
            </div>
          </div>

          {/* Right — Live JSON */}
          <div className="merch-right bg-tertiary-bg p-6 md:p-8 border-l border-tertiary-ink/5 relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-secondary-500/40" />
              <span className="font-mono text-caption text-tertiary-ink/45">output.json</span>
              <span
                className={`type-label ml-auto ${
                  isTyping ? 'text-primary-400' : 'text-status-success/50'
                }`}
              >
                {isTyping ? t('common:status.syncing') : t('common:status.live')}
              </span>
            </div>

            <pre
              ref={jsonRef}
              className="font-mono text-body-small leading-relaxed whitespace-pre-wrap break-words overflow-auto max-h-[500px]"
              dangerouslySetInnerHTML={{
                __html:
                  syntaxHighlight(displayedJson) +
                  (isTyping ? '<span class="animate-pulse text-primary-400">|</span>' : ''),
              }}
            />

            {/* Line numbers gutter effect */}
            <div className="absolute left-0 top-14 bottom-0 w-8 bg-gradient-to-r from-tertiary-ink/[0.01] to-transparent pointer-events-none" />
          </div>
        </div>

        {screenshots.length > 0 && (
          <div className="mt-10">
            <GalleryVariant images={screenshots} variant={settings.galleryStyle} alt={content.title} />
          </div>
        )}
      </div>
    </section>
  )
}
