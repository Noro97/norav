export interface SectionConfig {
  id: string
  labelKey: string
}

export interface TerminalLine {
  type: 'input' | 'output'
  content: string
}

export interface FilterState {
  categories: string[]
  priceRange: [number, number]
  sortBy: string
}

export interface Product {
  id: number
  name: string
  category: string
  subcategory: string
  price: number
  image: string
}

export interface MerchConfig {
  productType: string
  color: string
  size: string
  text: string
  quantity: number
  premium: boolean
}
