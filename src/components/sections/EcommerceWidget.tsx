import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useBlock } from '@/content/ContentProvider'
import { useCaseStudyLabel } from '@/content/case-studies'
import type { CaseStudyContent } from '@norav/content-schema'
import type { FilterState, Product } from '@/types'
import { ProductDetailModal } from './ProductDetailModal'

export const CATEGORY_COLORS: Record<string, string> = {
  Electronics: 'from-blue-900/40 to-blue-800/10',
  Clothing: 'from-crimson-900/40 to-crimson-800/10',
  Home: 'from-amber-900/40 to-amber-800/10',
  Sports: 'from-emerald-900/40 to-emerald-800/10',
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
      <line x1="68" y1="30" x2="132" y2="30" stroke="var(--color-crimson-500)" strokeWidth="1" opacity={hasCat ? 0.6 : 0.08} strokeDasharray={hasCat ? 'none' : '4 2'} />
      <line x1="168" y1="30" x2="228" y2="30" stroke="var(--color-crimson-500)" strokeWidth="1" opacity={hasSort ? 0.5 : 0.08} strokeDasharray={hasSort ? 'none' : '4 2'} />
      <line x1="55" y1="48" x2="88" y2="80" stroke="var(--color-crimson-500)" strokeWidth="1" opacity={hasPrice ? 0.4 : 0.06} />
      <line x1="115" y1="82" x2="178" y2="95" stroke="var(--color-crimson-500)" strokeWidth="1" opacity={0.3} />
      <line x1="155" y1="48" x2="188" y2="78" stroke="var(--color-crimson-500)" strokeWidth="1" opacity={0.25} />
      <line x1="238" y1="45" x2="212" y2="78" stroke="var(--color-crimson-500)" strokeWidth="1" opacity={hasSort ? 0.4 : 0.08} />

      <circle cx="50" cy="30" r="18" fill={hasCat ? 'var(--color-crimson-500)' : 'var(--color-secondary)'} stroke="var(--color-crimson-500)" strokeWidth="1.5" opacity={hasCat ? 1 : 0.3}>
        {hasCat && <animate attributeName="r" values="18;19;18" dur="2s" repeatCount="indefinite" />}
      </circle>
      <text x="50" y="34" textAnchor="middle" fill="white" fontSize="8" fontFamily="JetBrains Mono">CAT</text>

      <circle cx="150" cy="30" r="18" fill={hasCat ? 'var(--color-crimson-700)' : 'var(--color-secondary)'} stroke="var(--color-crimson-500)" strokeWidth="1" opacity={hasCat ? 0.8 : 0.2} />
      <text x="150" y="34" textAnchor="middle" fill="white" fontSize="8" fontFamily="JetBrains Mono">SUB</text>

      <circle cx="250" cy="30" r="18" fill={hasSort ? 'var(--color-crimson-700)' : 'var(--color-secondary)'} stroke="var(--color-crimson-500)" strokeWidth="1" opacity={hasSort ? 0.8 : 0.25} />
      <text x="250" y="34" textAnchor="middle" fill="white" fontSize="8" fontFamily="JetBrains Mono">SORT</text>

      <circle cx="100" cy="95" r="18" fill={hasPrice ? 'var(--color-crimson-700)' : 'var(--color-secondary)'} stroke="var(--color-crimson-500)" strokeWidth="1" opacity={hasPrice ? 0.8 : 0.2} />
      <text x="100" y="99" textAnchor="middle" fill="white" fontSize="7" fontFamily="JetBrains Mono">PRICE</text>

      <circle cx="200" cy="95" r="22" fill="var(--color-crimson-500)" fillOpacity="0.15" stroke="var(--color-crimson-500)" strokeWidth="1.5" opacity={0.9}>
        <animate attributeName="r" values="22;23;22" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="200" y="99" textAnchor="middle" fill="var(--color-crimson-500)" fontSize="7" fontFamily="JetBrains Mono">RESULT</text>
    </svg>
  )
}

export function EcommerceWidget({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<CaseStudyContent>('ecommerce')
  // Before the early return: the number is a hook, and a hook cannot sit
  // behind a conditional.
  const sectionLabel = useCaseStudyLabel('ecommerce', block?.content.sectionLabel ?? '')
  const { t } = useTranslation(['projects', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'ecommerce', sectionRef)
  const [filters, setFilters] = useState<FilterState>(parseFiltersFromURL)
  const [page, setPage] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // GSAP entrance
  useGSAP(() => {
    const sidebar = sectionRef.current!.querySelector('.ecom-sidebar')
    const grid = sectionRef.current!.querySelector('.ecom-grid')
    if (sidebar) {
      gsap.fromTo(sidebar,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
    if (grid) {
      gsap.fromTo(grid,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
  }, { scope: sectionRef })

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
  const { content } = block

  return (
    <section
      id={anchorId ?? 'ecommerce'}
      ref={sectionRef}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="label-mono">{sectionLabel}</span>
          <h2 className="text-display-lg font-bold text-white mt-3">
            {content.title}
          </h2>
          <p className="text-body-lg text-white/50 max-w-2xl mt-4">
            {content.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {content.techStack.map((tag) => (
              <span key={tag.name} className="case-study-pill text-xs font-mono text-white/45">
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
              <h4 className="font-mono text-xs text-white/40 tracking-wider uppercase mb-3">
                {t('projects:ecommerce.filterDependencyGraph')}
              </h4>
              <FilterGraph filters={filters} />
            </div>

            {/* Category filter */}
            <div className="case-study-card p-4">
              <h4 className="font-mono text-xs text-white/40 tracking-wider uppercase mb-3">
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
                            ? 'border-cyan-500 bg-cyan-500'
                            : 'border-white/20 group-hover:border-white/40'
                        }`}
                      >
                        {isActive && (
                          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-mono ${isActive ? 'text-white/80' : 'text-white/50'}`}>
                        {cat}
                      </span>
                      <span className="ml-auto text-xs font-mono text-white/40">{count}</span>
                    </button>
                  )
                })}
              </div>
              {filters.categories.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-1">
                    {availableSubcategories.map((sub) => (
                      <span key={sub} className="case-study-pill py-0.5 text-xs font-mono text-crimson-400/60 bg-crimson-500/5">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price range */}
            <div className="case-study-card p-4">
              <h4 className="font-mono text-xs text-white/40 tracking-wider uppercase mb-3">
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
                  className="w-full accent-crimson-500"
                />
                <div className="flex justify-between font-mono text-xs text-white/40">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="case-study-card p-4">
              <h4 className="font-mono text-xs text-white/40 tracking-wider uppercase mb-3">
                {t('projects:ecommerce.sortBy')}
              </h4>
              <div className="space-y-1">
                {SORT_OPTION_KEYS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setPage(0); setFilters((prev) => ({ ...prev, sortBy: opt.value })) }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-all ${
                      filters.sortBy === opt.value
                        ? 'text-cyan-400 bg-cyan-500/10'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/3'
                    }`}
                  >
                    {t(`projects:${opt.labelKey}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* URL params display */}
            <div className="case-study-card p-4 flex-1">
              <h4 className="font-mono text-xs text-white/40 tracking-wider uppercase mb-2">
                {t('projects:ecommerce.urlState')}
              </h4>
              <code className="text-xs font-mono text-crimson-400/80 break-all block leading-relaxed">
                {window.location.pathname}{filtersToParams(filters) || ''}
              </code>
            </div>
          </div>

          {/* Product Grid */}
          <div className="ecom-grid">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-white/40">
                {t('projects:ecommerce.productsCount', { filtered: filteredProducts.length, total: MOCK_PRODUCTS.length })}
              </span>
              {filters.categories.length > 0 && (
                <button
                  onClick={() => { setPage(0); setFilters((prev) => ({ ...prev, categories: [] })) }}
                  className="font-mono text-xs text-crimson-400/60 hover:text-crimson-400 transition-colors"
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
                      className={`aspect-square rounded-lg mb-3 flex flex-col items-center justify-center gap-1 bg-gradient-to-br ${CATEGORY_COLORS[product.category] ?? 'from-white/5 to-transparent'} border border-white/[0.04]`}
                    >
                      <span className="font-mono text-xs text-white/40 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <span className="font-mono text-xs text-white/45 group-hover:text-white/70 transition-colors">
                        {product.subcategory}
                      </span>
                    </div>
                    <h5 className="font-mono text-xs text-white/70 truncate" title={product.name}>
                      {product.name}
                    </h5>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-mono text-sm font-medium text-gold-400">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="font-mono text-xs text-white/40 uppercase">
                        #{String(product.id).padStart(3, '0')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="font-mono text-sm text-white/40">{t('projects:ecommerce.noProducts')}</span>
                  <button
                    onClick={() => setFilters({ categories: [], priceRange: [0, 1000], sortBy: 'price-asc' })}
                    className="font-mono text-xs text-crimson-400/60 hover:text-crimson-400 mt-2 transition-colors"
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
                  className="w-8 h-8 rounded border border-white/10 flex items-center justify-center font-mono text-xs text-white/40 hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-xs transition-all ${
                      page === i
                        ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                        : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="w-8 h-8 rounded border border-white/10 flex items-center justify-center font-mono text-xs text-white/40 hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
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
