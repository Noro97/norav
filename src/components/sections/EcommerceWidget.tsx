import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useReveal } from '@/hooks/useReveal'
import { useBlock } from '@/content/ContentProvider'
import { useCaseStudyLabel } from '@/content/case-studies'
import { GalleryVariant } from '@/components/ui/effects/GalleryVariant'
import type { CaseStudyContent, CaseStudySettings } from '@norav/content-schema'
import type { FilterState, Product } from '@/types'
import { ProductDetailModal } from './ProductDetailModal'

// A tint per category, from the three roles — the difference between two
// tiles is the hue of the accent, not a fourth colour.
export const CATEGORY_COLORS: Record<string, string> = {
  Electronics: 'from-secondary-900/60 to-secondary-800/10',
  Clothing: 'from-primary-900/40 to-primary-800/10',
  Home: 'from-tertiary-ink/[0.08] to-tertiary-ink/[0.02]',
  Sports: 'from-secondary-700/40 to-secondary-900/10',
}

const ITEMS_PER_PAGE = 12

const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Sports']
const SUBCATEGORIES: Record<string, string[]> = {
  Electronics: ['Phones', 'Laptops', 'Audio'],
  Clothing: ['Shirts', 'Pants', 'Shoes'],
  Home: ['Kitchen', 'Furniture', 'Decor'],
  Sports: ['Fitness', 'Outdoor', 'Team'],
}

const PRODUCT_NAMES: Record<string, string[]> = {
  Phones: ['Pixel Pro 9', 'Galaxy S25', 'iPhone 16', 'OnePlus 13', 'Xperia V'],
  Laptops: ['MacBook Air M4', 'ThinkPad X1', 'Surface Pro', 'XPS 15', 'Gram 17'],
  Audio: ['AirPods Max', 'WH-1000XM6', 'Momentum 5', 'Buds Pro 3', 'QuietComfort'],
  Shirts: ['Oxford Classic', 'Linen Breeze', 'Tech Polo', 'Merino Crew'],
  Pants: ['Chino Slim', 'Cargo Tech', 'Jogger Pro', 'Denim Raw'],
  Shoes: ['Runner GT', 'Trail X3', 'Loafer Suede', 'Boot Chelsea'],
  Kitchen: ['Brew Station', 'Chef Knife Set', 'Cast Iron Pro', 'Blender Turbo', 'Rice Cooker'],
  Furniture: ['Desk Stand Up', 'Chair Ergo Pro', 'Shelf Modular', 'Lamp Arc', 'Sofa Compact'],
  Decor: ['Planter Geo', 'Mirror Round', 'Clock Minimal', 'Rug Woven', 'Vase Ceramic'],
  Fitness: ['Dumbbell Set', 'Yoga Mat Pro', 'Resistance Kit', 'Jump Rope'],
  Outdoor: ['Tent Ultra', 'Pack 40L', 'Hammock Lite', 'Headlamp 600'],
  Team: ['Jersey Custom', 'Ball Match', 'Goal Net', 'Whistle Pro'],
}

const MOCK_PRODUCTS: Product[] = (() => {
  const products: Product[] = []
  let id = 1
  CATEGORIES.forEach((cat) => {
    const subs = SUBCATEGORIES[cat]!
    subs.forEach((sub) => {
      const names = PRODUCT_NAMES[sub]!
      names.forEach((name) => {
        const basePrice = cat === 'Electronics' ? 200 : cat === 'Clothing' ? 40 : cat === 'Home' ? 60 : 30
        products.push({
          id: id++,
          name,
          category: cat,
          subcategory: sub,
          price: Math.round((basePrice + Math.random() * basePrice * 3) * 100) / 100,
          image: `https://picsum.photos/seed/product${id}/200/200`,
        })
      })
    })
  })
  return products
})()

const SORT_OPTION_KEYS: { value: string; labelKey: string }[] = [
  { value: 'price-asc', labelKey: 'ecommerce.sort.priceLowHigh' },
  { value: 'price-desc', labelKey: 'ecommerce.sort.priceHighLow' },
  { value: 'name-asc', labelKey: 'ecommerce.sort.nameAZ' },
]

function parseFiltersFromURL(): FilterState {
  const params = new URLSearchParams(window.location.search)
  return {
    categories: params.get('cat')?.split(',').filter(Boolean) ?? [],
    priceRange: [
      Number(params.get('pmin') ?? 0),
      Number(params.get('pmax') ?? 1000),
    ],
    sortBy: params.get('sort') ?? 'price-asc',
  }
}

function filtersToParams(filters: FilterState): string {
  const params = new URLSearchParams()
  if (filters.categories.length > 0) params.set('cat', filters.categories.join(','))
  if (filters.priceRange[0] > 0) params.set('pmin', String(filters.priceRange[0]))
  if (filters.priceRange[1] < 1000) params.set('pmax', String(filters.priceRange[1]))
  if (filters.sortBy !== 'price-asc') params.set('sort', filters.sortBy)
  const str = params.toString()
  return str ? `?${str}` : ''
}

function FilterGraph({ filters }: { filters: FilterState }) {
  const hasCat = filters.categories.length > 0
  const hasPrice = filters.priceRange[0] > 0 || filters.priceRange[1] < 1000
  const hasSort = filters.sortBy !== 'price-asc'

  return (
    <svg viewBox="0 0 300 120" className="w-full">
      <line x1="68" y1="30" x2="132" y2="30" stroke="var(--color-primary-500)" strokeWidth="1" opacity={hasCat ? 0.6 : 0.08} strokeDasharray={hasCat ? 'none' : '4 2'} />
      <line x1="168" y1="30" x2="228" y2="30" stroke="var(--color-primary-500)" strokeWidth="1" opacity={hasSort ? 0.5 : 0.08} strokeDasharray={hasSort ? 'none' : '4 2'} />
      <line x1="55" y1="48" x2="88" y2="80" stroke="var(--color-primary-500)" strokeWidth="1" opacity={hasPrice ? 0.4 : 0.06} />
      <line x1="115" y1="82" x2="178" y2="95" stroke="var(--color-primary-500)" strokeWidth="1" opacity={0.3} />
      <line x1="155" y1="48" x2="188" y2="78" stroke="var(--color-primary-500)" strokeWidth="1" opacity={0.25} />
      <line x1="238" y1="45" x2="212" y2="78" stroke="var(--color-primary-500)" strokeWidth="1" opacity={hasSort ? 0.4 : 0.08} />

      <circle cx="50" cy="30" r="18" fill={hasCat ? 'var(--color-primary-500)' : 'var(--color-secondary)'} stroke="var(--color-primary-500)" strokeWidth="1.5" opacity={hasCat ? 1 : 0.3}>
        {hasCat && <animate attributeName="r" values="18;19;18" dur="2s" repeatCount="indefinite" />}
      </circle>
      <text x="50" y="34" textAnchor="middle" fill="var(--color-tertiary-ink)" fontSize="8" fontFamily="var(--font-mono)">CAT</text>

      <circle cx="150" cy="30" r="18" fill={hasCat ? 'var(--color-primary-700)' : 'var(--color-secondary)'} stroke="var(--color-primary-500)" strokeWidth="1" opacity={hasCat ? 0.8 : 0.2} />
      <text x="150" y="34" textAnchor="middle" fill="var(--color-tertiary-ink)" fontSize="8" fontFamily="var(--font-mono)">SUB</text>

      <circle cx="250" cy="30" r="18" fill={hasSort ? 'var(--color-primary-700)' : 'var(--color-secondary)'} stroke="var(--color-primary-500)" strokeWidth="1" opacity={hasSort ? 0.8 : 0.25} />
      <text x="250" y="34" textAnchor="middle" fill="var(--color-tertiary-ink)" fontSize="8" fontFamily="var(--font-mono)">SORT</text>

      <circle cx="100" cy="95" r="18" fill={hasPrice ? 'var(--color-primary-700)' : 'var(--color-secondary)'} stroke="var(--color-primary-500)" strokeWidth="1" opacity={hasPrice ? 0.8 : 0.2} />
      <text x="100" y="99" textAnchor="middle" fill="var(--color-tertiary-ink)" fontSize="7" fontFamily="var(--font-mono)">PRICE</text>

      <circle cx="200" cy="95" r="22" fill="var(--color-primary-500)" fillOpacity="0.15" stroke="var(--color-primary-500)" strokeWidth="1.5" opacity={0.9}>
        <animate attributeName="r" values="22;23;22" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="200" y="99" textAnchor="middle" fill="var(--color-primary-500)" fontSize="7" fontFamily="var(--font-mono)">RESULT</text>
    </svg>
  )
}

export function EcommerceWidget({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<CaseStudyContent, CaseStudySettings>('ecommerce')
  // Before the early return: the number is a hook, and a hook cannot sit
  // behind a conditional.
  const sectionLabel = useCaseStudyLabel('ecommerce', block?.content.sectionLabel ?? '')
  const { t } = useTranslation(['projects', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'ecommerce', sectionRef)
  const [filters, setFilters] = useState<FilterState>(parseFiltersFromURL)
  const [page, setPage] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useReveal(sectionRef, '.ecom-sidebar, .ecom-grid')

  // URL sync
  useEffect(() => {
    const newUrl = window.location.pathname + filtersToParams(filters)
    window.history.replaceState(null, '', newUrl)
  }, [filters])

  const toggleCategory = useCallback((cat: string) => {
    setPage(0)
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }))
  }, [])

  const availableSubcategories = useMemo(() => {
    if (filters.categories.length === 0) return Object.values(SUBCATEGORIES).flat()
    return filters.categories.flatMap((cat) => SUBCATEGORIES[cat] ?? [])
  }, [filters.categories])

  const filteredProducts = useMemo(() => {
    let products = [...MOCK_PRODUCTS]

    if (filters.categories.length > 0) {
      products = products.filter((p) => filters.categories.includes(p.category))
    }

    products = products.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    switch (filters.sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        products.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return products
  }, [filters])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  if (!block) return null
  const { content, settings } = block
  const screenshots = content.screenshots.map((s) => s.image).filter(Boolean)

  return (
    <section
      id={anchorId ?? 'ecommerce'}
      ref={sectionRef}
      className="relative px-gutter-x py-24"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="label-mono">{sectionLabel}</span>
          <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3">
            {content.title}
          </h2>
          <p className="text-body-large text-tertiary-ink/50 max-w-2xl mt-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-stretch">
          {/* Sidebar */}
          <div className="ecom-sidebar flex flex-col gap-5">
            {/* Dependency Graph */}
            <div className="case-study-card p-4">
              <h4 className="type-label text-tertiary-ink/40 mb-3">
                {t('projects:ecommerce.filterDependencyGraph')}
              </h4>
              <FilterGraph filters={filters} />
            </div>

            {/* Category filter */}
            <div className="case-study-card p-4">
              <h4 className="type-label text-tertiary-ink/40 mb-3">
                {t('projects:ecommerce.categories')}
              </h4>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const isActive = filters.categories.includes(cat)
                  const count = MOCK_PRODUCTS.filter((p) => p.category === cat).length
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center gap-2.5 w-full py-1.5 group text-left"
                    >
                      <div
                        className={`w-4 h-4 rounded border shrink-0 transition-all flex items-center justify-center ${
                          isActive
                            ? 'border-secondary-500 bg-secondary-500'
                            : 'border-tertiary-ink/20 group-hover:border-tertiary-ink/40'
                        }`}
                      >
                        {isActive && (
                          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-tertiary-ink" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-body-small font-mono ${isActive ? 'text-tertiary-ink/80' : 'text-tertiary-ink/50'}`}>
                        {cat}
                      </span>
                      <span className="ml-auto text-caption font-mono text-tertiary-ink/40">{count}</span>
                    </button>
                  )
                })}
              </div>
              {filters.categories.length > 0 && (
                <div className="mt-3 pt-3 border-t border-tertiary-ink/5">
                  <div className="flex flex-wrap gap-1">
                    {availableSubcategories.map((sub) => (
                      <span key={sub} className="case-study-pill py-0.5 text-caption font-mono text-primary-400/60 bg-primary-500/5">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price range */}
            <div className="case-study-card p-4">
              <h4 className="type-label text-tertiary-ink/40 mb-3">
                {t('projects:ecommerce.priceRange')}
              </h4>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], Number(e.target.value)],
                    }))
                  }
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between font-mono text-caption text-tertiary-ink/40">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="case-study-card p-4">
              <h4 className="type-label text-tertiary-ink/40 mb-3">
                {t('projects:ecommerce.sortBy')}
              </h4>
              <div className="space-y-1">
                {SORT_OPTION_KEYS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setPage(0); setFilters((prev) => ({ ...prev, sortBy: opt.value })) }}
                    className={`w-full text-left px-2 py-1.5 rounded text-caption font-mono transition-all ${
                      filters.sortBy === opt.value
                        ? 'text-secondary-400 bg-secondary-500/10'
                        : 'text-tertiary-ink/40 hover:text-tertiary-ink/60 hover:bg-tertiary-ink/3'
                    }`}
                  >
                    {t(`projects:${opt.labelKey}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* URL params display */}
            <div className="case-study-card p-4 flex-1">
              <h4 className="type-label text-tertiary-ink/40 mb-2">
                {t('projects:ecommerce.urlState')}
              </h4>
              <code className="text-caption font-mono text-primary-400/80 break-all block leading-relaxed">
                {window.location.pathname}{filtersToParams(filters) || ''}
              </code>
            </div>
          </div>

          {/* Product Grid */}
          <div className="ecom-grid">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-caption text-tertiary-ink/40">
                {t('projects:ecommerce.productsCount', { filtered: filteredProducts.length, total: MOCK_PRODUCTS.length })}
              </span>
              {filters.categories.length > 0 && (
                <button
                  onClick={() => { setPage(0); setFilters((prev) => ({ ...prev, categories: [] })) }}
                  className="font-mono text-caption text-primary-400/60 hover:text-primary-400 transition-colors"
                >
                  {t('common:buttons.clearFilters')}
                </button>
              )}
            </div>

            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="case-study-card p-3 group cursor-pointer hover:-translate-y-0.5 transition-transform"
                  >
                    <div
                      className={`aspect-square rounded-lg mb-3 flex flex-col items-center justify-center gap-1 bg-gradient-to-br ${CATEGORY_COLORS[product.category] ?? 'from-tertiary-ink/5 to-transparent'} border border-tertiary-ink/[0.04]`}
                    >
                      <span className="type-label text-tertiary-ink/40">
                        {product.category}
                      </span>
                      <span className="font-mono text-caption text-tertiary-ink/45 group-hover:text-tertiary-ink/70 transition-colors">
                        {product.subcategory}
                      </span>
                    </div>
                    <h5 className="font-mono text-caption text-tertiary-ink/70 truncate" title={product.name}>
                      {product.name}
                    </h5>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-mono text-body-small font-medium text-secondary-300">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="font-mono text-caption text-tertiary-ink/40 uppercase">
                        #{String(product.id).padStart(3, '0')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="font-mono text-body-small text-tertiary-ink/40">{t('projects:ecommerce.noProducts')}</span>
                  <button
                    onClick={() => setFilters({ categories: [], priceRange: [0, 1000], sortBy: 'price-asc' })}
                    className="font-mono text-caption text-primary-400/60 hover:text-primary-400 mt-2 transition-colors"
                  >
                    {t('common:buttons.resetAll')}
                  </button>
                </div>
              )}
            </div>

            {/* Pagination — always visible below scroll area */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-8 h-8 rounded border border-tertiary-ink/10 flex items-center justify-center font-mono text-caption text-tertiary-ink/40 hover:text-tertiary-ink/70 hover:border-tertiary-ink/20 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-caption transition-all ${
                      page === i
                        ? 'border-secondary-500/40 bg-secondary-500/10 text-secondary-400'
                        : 'border-tertiary-ink/10 text-tertiary-ink/40 hover:text-tertiary-ink/70 hover:border-tertiary-ink/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="w-8 h-8 rounded border border-tertiary-ink/10 flex items-center justify-center font-mono text-caption text-tertiary-ink/40 hover:text-tertiary-ink/70 hover:border-tertiary-ink/20 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>

        {screenshots.length > 0 && (
          <div className="mt-10">
            <GalleryVariant images={screenshots} variant={settings.galleryStyle} alt={content.title} />
          </div>
        )}
      </div>
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  )
}
