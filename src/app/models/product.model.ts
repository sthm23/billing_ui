import { BaseListResponse } from "./app.models"

export interface Product {
  id: string
  storeId: string
  name: string
  categoryId?: string
  brandId?: string
  isArchived: boolean
  createdAt: string
  images: string[]

  // store: Store
  // category?: Category
  // brand?: Brand
  // variants: ProductVariant[]
  // attributes: ProductAttributeValue[]
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string // ску будет уникален в пределах магазина
  barCode: string
  price: number
  storeId: string // это для быстрого поиска уникального SKU в пределах магазина
  product: Product
  // inventory: Inventory[]
  // orderItems:     OrderItem[]
  // stockMovements: StockMovement[]
  // attributes:     VariantAttributeValue[]
}
export interface ProductResponse extends BaseListResponse {
  data: Product[]
}
export interface CreateProduct {
  storeId: string
  name: string
  images?: string[] | null
  category?: string // categoryId
  brand?: string // brandId
}
export interface Category {
  id: string
  name: string
  parentId: string | null
  children?: Category[]
}
export interface CategoryResponse extends BaseListResponse {
  data: Category[]
}

export interface Brand {
  id: string
  name: string,
  logoUrl: string | null
}
export interface BrandResponse extends BaseListResponse {
  data: Brand[]
}
