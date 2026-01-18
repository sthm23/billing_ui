
export interface Product {
  id: string
  storeId: string
  name: string
  categoryId?: string
  brandId?: string
  isArchived: boolean
  createdAt: string

  // store: Store
  // category?: Category
  // brand?: Brand
  // images: ProductImage[]
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
