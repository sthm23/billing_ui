import { BaseListResponse } from "./app.models"
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
  creator: Admin
  owner: User
  staff: Staff[]
  // products:   Product[]
  warehouses: Warehouse[]
  // orders:     Order[]
}
export interface StoreResponse extends BaseListResponse {
  data: Store[]
}

export interface CreateStore {
  name: string
  ownerId: string
}

export interface CreateWarehouse {
  name: string
  storeId: string
  ownerId: string
}

export interface Warehouse {
  id: string
  name: string
  storeId: string
  isActive: boolean
  createdAt: string
  staffWarehouses: { id: string, staffId: string, warehouseId: string }[]
}
