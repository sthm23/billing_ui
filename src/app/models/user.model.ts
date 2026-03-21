import { BaseListResponse } from "./app.models"
import { OrderStatus } from "./order.model"
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
  customer: Customer | null
  refreshSessions?: RefreshSession[]
}

export interface UserInfo {
  id: string
  fullName: string
  phone: string
  type: UserType
  role: UserRole
  createdAt: string
  image: string | null


  auth: AuthAccount | null;
  staff: {
    createdAt: string
    id: string
    isActive: boolean
    role: StaffRole
    storeId: string
    userId: string
    warehouseId: string
    orders: Order[]
    payments: StaffPayment[]
  }
}

export interface UserStockMovement {
  createdAt: string
  createdById: string
  id: string
  quantity: number
  reason: "PURCHASE" | "SALE" | "ADJUSTMENT"
  type: "IN" | "OUT"
  unitCost: number
  variantId: string
  warehouseId: string
  variant: {
    barCode: number
    id: string
    price: number
    productId: string
    sku: string
    storeId: string
  }
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

export interface Customer {
  id: string
  userId: string
  user: User
  stores: Store[]
}

export interface Order {
  cashierId: string
  channel: "ONLINE" | "POS"
  createdAt: string
  customerId: string
  id: string
  paidAmount: number
  status: OrderStatus
  storeId: string
  totalAmount: number
  warehouseId: string

}
export interface StaffPayment {
  amount: number
  createdAt: string
  createdBy: string
  id: string
  orderId: string
  paidAt: string | null
  type: "CASH" | "CARD"
}
export interface Staff {
  id: string
  userId: string
  storeId: string
  role: StaffRole
  isActive: boolean
  user: User
  store: Store
  warehouse: StaffWarehouse
  // stockMoves: StockMovement[]
  orders: Order[]
  payments: StaffPayment[]

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

export interface CustomersResponse extends BaseListResponse {
  data: User[]
}


export interface UserErrorResponse {
  statusCode: number
  message: string
  error: string
}

export interface CreateCustomer {
  fullName: string
  phone: string
}
