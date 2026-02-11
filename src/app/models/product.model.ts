import { BaseListResponse } from "./app.models"

export interface BaseProduct {
  id: string
  storeId: string
  name: string
  category: string
  brand: string
  isArchived: boolean
  createdAt: string
  images: { url: string, id: string, isMain: boolean }[]
}

export interface Product extends BaseProduct {
  variants: number
}

export interface ProductDetail extends BaseProduct {
  variants: ProductVariant[]
  attributes: ProductAttributeValue[]
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

export interface ProductAttributeValue { }
export interface ProductResponse extends BaseListResponse {
  data: Product[]
}
export interface CreateProduct {
  storeId: string
  name: string
  images?: string[] | null
  categoryId?: string // categoryId
  brandId?: string // brandId
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

export interface UploadImageResponse {
  url: string;
  expiresIn: number;
}

export interface UploadImageRequest {
  storeId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface FileUploadData {
  file: File;
  url?: UploadImageRequest;
  size: number;
}
