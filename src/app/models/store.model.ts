import { BaseListResponse } from "./app.models"
import { Category } from "./product.model"
import { Admin, Staff, User } from "./user.model"

export enum OrgLevel {
  OWNER = 'OWNER',
  STORE = 'STORE',
  WAREHOUSE = 'WAREHOUSE',
  STAFF = 'STAFF'
}

export interface Store {
  id: string
  name: string
  ownerId: string
  createdAt: string
  createdBy: string // adminId
  creator: User
  warehouse: Warehouse[]
  categories: { category: Category[], categoryId: string, storeId: string }[]
  // products:   Product[]
  // orders:     Order[]
}
export interface StoreResponse extends BaseListResponse<Store> {
  data: Store[]
}

export interface CreateStore {
  name: string
  ownerId: string
  categoryId: string
  warehouseName: string
  brandIds: string[]
  attributeIds: string[]
}

export interface CreateWarehouse {
  name: string
  storeId: string
  ownerId: string
}

export interface Warehouse {
  id: string
  name: string
  staffId: string
  isActive: boolean
  storeId: string
}
