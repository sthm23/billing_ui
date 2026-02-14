import { BaseListResponse } from "./app.models"
import { Store } from "./store.model"

export enum UserType {
  CUSTOMER = 'CUSTOMER',
  STAFF = 'STAFF'
}
export enum StaffRole {
  SELLER = 'SELLER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  WAREHOUSE = 'WAREHOUSE',
  OWNER = 'OWNER',
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER',
}



export interface User {
  id: string
  fullName: string
  phone: string
  type: UserType
  createdAt: string

  auth: AuthAccount | null
  staff: Staff | null
  role: UserRole
  // orders: Order[]
  refreshSessions?: RefreshSession[]
}


export interface AuthAccount {
  id: string
  userId: string
  login: string   // e.g. email or username or phone
  passwordHash: string
  isActive: boolean
  createdAt: string
  user?: User
}

export interface Admin {
  id: string
  userId: string
  isActive: boolean
  createdAt: string

  user: User
  stores: Store[]
}

export interface RefreshSession {
  id: string
  userId: string
  refreshHash: string
  userAgent?: string
  ip?: string
  expiresAt: string
  createdAt: string
  isRevoked: boolean
  user: User
}



export interface Staff {
  id: string
  userId: string
  storeId: string
  role: StaffRole
  isActive: Boolean
  user: User
  store: Store
  warehouse: StaffWarehouse
  // stockMoves: StockMovement[]
  // orders: Order[]

}

export interface StaffWarehouse {
  id: string
  name: string
  staffId: string
  isActive: boolean
  storeId: string
}

export interface UserCreateRequest {
  fullName: string
  phone: string
  login: string
  password: string
  role: string
  isActive: boolean
  type: UserType
  storeId?: string
  warehouseId?: string
}

export interface UsersResponse extends BaseListResponse {
  data: User[]
}


export interface UserErrorResponse {
  statusCode: number
  message: string
  error: string
}

