import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useScrollProgress'
import type { FilterState, Product } from '@/types'

const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Sports']
const SUBCATEGORIES: Record<string, string[]> = {
  Electronics: ['Phones', 'Laptops', 'Audio'],
  Clothing: ['Shirts', 'Pants', 'Shoes'],
  Home: ['Kitchen', 'Furniture', 'Decor'],
  Sports: ['Fitness', 'Outdoor', 'Team'],
}

const PRODUCT_NAMES: Record<string, string[]> = {
  Phones: ['Pixel Pro 9', 'Galaxy S25', 'iPhone 16', 'OnePlus 13', 'Xperia V', 'Nothing Phone 3'],
  Laptops: ['MacBook Air M4', 'ThinkPad X1', 'Surface Pro', 'XPS 15', 'Gram 17', 'ZenBook S'],
  Audio: ['AirPods Max', 'WH-1000XM6', 'Momentum 5', 'Buds Pro 3', 'QuietComfort', 'Pixel Buds'],
  Shirts: ['Oxford Classic', 'Linen Breeze', 'Tech Polo', 'Merino Crew', 'Flannel Check', 'Henley Knit'],
  Pants: ['Chino Slim', 'Cargo Tech', 'Jogger Pro', 'Denim Raw', 'Trouser Wool', 'Short Board'],
  Shoes: ['Runner GT', 'Trail X3', 'Loafer Suede', 'Boot Chelsea', 'Sneaker V2', 'Sandal Sport'],
  Kitchen: ['Brew Station', 'Chef Knife Set', 'Cast Iron Pro', 'Blender Turbo', 'Rice Cooker', 'Air Fryer XL'],
  Furniture: ['Desk Stand Up', 'Chair Ergo Pro', 'Shelf Modular', 'Lamp Arc', 'Sofa Compact', 'Bed Frame Oak'],
  Decor: ['Planter Geo', 'Mirror Round', 'Clock Minimal', 'Rug Woven', 'Vase Ceramic', 'Print Abstract'],
  Fitness: ['Dumbbell Set', 'Yoga Mat Pro', 'Resistance Kit', 'Jump Rope', 'Kettlebell', 'Bench Flat'],
  Outdoor: ['Tent Ultra', 'Pack 40L', 'Hammock Lite', 'Headlamp 600', 'Flask Insulated', 'Trekking Poles'],
  Team: ['Jersey Custom', 'Ball Match', 'Goal Net', 'Whistle Pro', 'Shin Guard', 'Glove Keeper'],
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
      {/* Edges — drawn first (behind nodes) */}
      <line x1="68" y1="30" x2="132" y2="30" stroke="#B51A2B" strokeWidth="1" opacity={hasCat ? 0.6 : 0.08} strokeDasharray={hasCat ? 'none' : '4 2'} />
      <line x1="168" y1="30" x2="228" y2="30" stroke="#B51A2B" strokeWidth="1" opacity={hasSort ? 0.5 : 0.08} strokeDasharray={hasSort ? 'none' : '4 2'} />
      <line x1="55" y1="48" x2="88" y2="80" stroke="#B51A2B" strokeWidth="1" opacity={hasPrice ? 0.4 : 0.06} />
      <line x1="115" y1="82" x2="178" y2="95" stroke="#B51A2B" strokeWidth="1" opacity={0.3} />
      <line x1="155" y1="48" x2="188" y2="78" stroke="#B51A2B" strokeWidth="1" opacity={0.25} />
      <line x1="238" y1="45" x2="212" y2="78" stroke="#B51A2B" strokeWidth="1" opacity={hasSort ? 0.4 : 0.08} />

      {/* Category node */}
      <circle cx="50" cy="30" r="18" fill={hasCat ? '#B51A2B' : '#1a1a2e'} stroke="#B51A2B" strokeWidth="1.5" opacity={hasCat ? 1 : 0.3}>
        {hasCat && <animate attributeName="r" values="18;19;18" dur="2s" repeatCount="indefinite" />}
      </circle>
      <text x="50" y="34" textAnchor="middle" fill="white" fontSize="8" fontFamily="JetBrains Mono">CAT</text>

      {/* Subcategory node */}
      <circle cx="150" cy="30" r="18" fill={hasCat ? '#541A2E' : '#1a1a2e'} stroke="#B51A2B" strokeWidth="1" opacity={hasCat ? 0.8 : 0.2} />
      <text x="150" y="34" textAnchor="middle" fill="white" fontSize="8" fontFamily="JetBrains Mono">SUB</text>

      {/* Sort node */}
      <circle cx="250" cy="30" r="18" fill={hasSort ? '#541A2E' : '#1a1a2e'} stroke="#B51A2B" strokeWidth="1" opacity={hasSort ? 0.8 : 0.25} />
      <text x="250" y="34" textAnchor="middle" fill="white" fontSize="8" fontFamily="JetBrains Mono">SORT</text>

      {/* Price node */}
      <circle cx="100" cy="95" r="18" fill={hasPrice ? '#541A2E' : '#1a1a2e'} stroke="#B51A2B" strokeWidth="1" opacity={hasPrice ? 0.8 : 0.2} />
      <text x="100" y="99" textAnchor="middle" fill="white" fontSize="7" fontFamily="JetBrains Mono">PRICE</text>

      {/* Result node */}
      <circle cx="200" cy="95" r="22" fill="#B51A2B" fillOpacity="0.15" stroke="#B51A2B" strokeWidth="1.5" opacity={0.9}>
        <animate attributeName="r" values="22;23;22" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="200" y="99" textAnchor="middle" fill="#B51A2B" fontSize="7" fontFamily="JetBrains Mono">RESULT</text>
    </svg>
  )
}

export function EcommerceWidget() {
  const { t } = useTranslation(['projects', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('ecommerce', sectionRef)
  const [filters, setFilters] = useState<FilterState>(parseFiltersFromURL)

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
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }))
  }, [])

  // Available subcategories based on selected categories
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

  return (
    <section
      id="ecommerce"
      ref={sectionRef}
      className="relative min-h-screen px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="label-mono">{t('projects:ecommerce.sectionLabel')}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3">
            {t('projects:ecommerce.title')}
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mt-4">
            {t('projects:ecommerce.description')}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['URL State', 'Faceted Search', 'Dependency Graph', 'React.useMemo'].map((tag) => (
              <span key={tag} className="px-2 py-1 text-[10px] font-mono text-white/30 border border-white/8 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <div className="ecom-sidebar space-y-5">
            {/* Dependency Graph */}
            <div className="glass-card p-4">
              <h4 className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-3">
                {t('projects:ecommerce.filterDependencyGraph')}
              </h4>
              <FilterGraph filters={filters} />
            </div>

            {/* Category filter */}
            <div className="glass-card p-4">
              <h4 className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-3">
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
                            ? 'border-crimson-500 bg-crimson-500'
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
                      <span className="ml-auto text-[10px] font-mono text-white/40">{count}</span>
                    </button>
                  )
                })}
              </div>
              {/* Active subcategories */}
              {filters.categories.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex flex-wrap gap-1">
                    {availableSubcategories.map((sub) => (
                      <span key={sub} className="px-1.5 py-0.5 text-[10px] font-mono text-crimson-400/60 bg-crimson-500/5 rounded">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price range */}
            <div className="glass-card p-4">
              <h4 className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-3">
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
            <div className="glass-card p-4">
              <h4 className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-3">
                {t('projects:ecommerce.sortBy')}
              </h4>
              <div className="space-y-1">
                {SORT_OPTION_KEYS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters((prev) => ({ ...prev, sortBy: opt.value }))}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-all ${
                      filters.sortBy === opt.value
                        ? 'text-crimson-400 bg-crimson-500/10'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/3'
                    }`}
                  >
                    {t(`projects:${opt.labelKey}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* URL params display */}
            <div className="glass-card p-4">
              <h4 className="font-mono text-[10px] text-white/40 tracking-wider uppercase mb-2">
                {t('projects:ecommerce.urlState')}
              </h4>
              <code className="text-[11px] font-mono text-crimson-400/80 break-all block leading-relaxed">
                {window.location.pathname}{filtersToParams(filters) || ''}
              </code>
            </div>
          </div>

          {/* Product Grid */}
          <div className="ecom-grid">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-white/40">
                {t('projects:ecommerce.productsCount', { filtered: filteredProducts.length, total: MOCK_PRODUCTS.length })}
              </span>
              {filters.categories.length > 0 && (
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, categories: [] }))}
                  className="font-mono text-[10px] text-crimson-400/60 hover:text-crimson-400 transition-colors"
                >
                  {t('common:buttons.clearFilters')}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.slice(0, 24).map((product) => (
                <div
                  key={product.id}
                  className="glass-card p-3 group cursor-pointer hover:translate-y-[-2px] transition-transform"
                >
                  <div
                    className="aspect-square rounded-lg mb-3 flex flex-col items-center justify-center gap-1 relative overflow-hidden"
                    style={{ backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
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
                    <span className="font-mono text-sm font-medium text-crimson-400">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="font-mono text-[9px] text-white/40 uppercase">
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
        </div>
      </div>
    </section>
  )
}
