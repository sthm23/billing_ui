import { BaseListResponse } from "./app.models"
import { Warehouse } from "./store.model"

export interface BaseProduct {
  id: string
  storeId: string
  warehouseId: string
  warehouse: Warehouse
  name: string
  category: string
  brand: string
  isArchived: boolean
  description: string | null
  createdAt: string
  priceRange: {
    min: string
    max: string
  }
  tags: ProductTag[]
  images: { url: string, id: string, isMain: boolean }[]
}

export interface Product extends BaseProduct {
  variants: { id: string, price: number, quantity: number }[]
}

export interface ProductDetail extends BaseProduct {
  variants: ProductVariant[]
  attributes: Attribute[]
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string // ску будет уникален в пределах магазина
  barCode: string
  price: number
  storeId: string // это для быстрого поиска уникального SKU в пределах магазина
  product: Product
  quantity: number
  // orderItems:     OrderItem[]
  stockMovements: StockMovement[]
  attributes: AttributeItem[]
}

export interface StockMovement {
  id: string
  type: 'IN' | 'OUT'
  reason: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN'
  warehouseId: string
  quantity: number
  unitCost: string
  createdAt: string
  createdBy: {
    role: 'OWNER' | 'STAFF'
    isActive: boolean
    user: {
      id: string
      fullName: string
      phone: string
      role: 'OWNER' | 'STAFF'
      type: 'OWNER' | 'STAFF'
      createdAt: string
    }
  }
}

export interface SearchProductResponse extends BaseListResponse {
  data: ProductVariant[]
}
export interface ProductResponse extends BaseListResponse {
  data: Product[]
}
export interface CreateProduct {
  warehouseId: string
  name: string
  images?: string[] | null
  categoryId?: string // categoryId
  brandId?: string // brandId
  attributeIds: string[],
  tagIds: string[],
  description?: string
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

export enum AttributeType {
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
}
export interface Attribute {
  id: string,
  name: string,
  type: AttributeType
}

export interface AttributeDetail extends Attribute {
  values: AttributeItem[]
}
export interface AttributeItem {
  id: string,
  attributeId: string,
  attributeName: string,
  value: string | number | boolean
}

export interface ProductTag {
  id: string
  value: string
  tagId: string
  tagName: string
}

export interface TagValue {
  id: string
  tagId: string
  value: string
}
export interface TagList {
  id: string
  name: string
  values: TagValue[]
}
export interface AttributeValue {
  attributeValueId: string;
  value: string;
}
export interface ProductVariantPayload {
  retailPrice: number;
  costPrice: number;
  quantity: number;
  attributes: AttributeValue[];
}
export interface CreateProductVariantPayload {
  storeId: string;
  warehouseId: string;
  productId: string;
  category: string;
  variants: ProductVariantPayload[];
}

export interface Inventory {
  id: string
  quantity: number
  variantId: string
  warehouseId: string
}

export interface AttributePayload {
  name: string;
  type: AttributeType;
}

export interface AttributeValuePayload {
  attributeId: string;
  value: string | number | boolean;
}

export interface AddInventoryPayload {
  warehouseId: string;
  variantId: string;
  quantity: number;
  costPrice: number;
  price: number;
}
