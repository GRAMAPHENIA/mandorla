export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: "cookies" | "pastries" | "breads" | "seasonal"
  featured: boolean
  inStock: boolean
  ingredients?: string[]
  allergens?: string[]
}
