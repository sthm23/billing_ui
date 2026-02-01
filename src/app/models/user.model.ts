
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

export enum OrgLevel {
  OWNER = 'OWNER',
  STORE = 'STORE',
  WAREHOUSE = 'WAREHOUSE',
  STAFF = 'STAFF'
}

export interface User {
  id: string
  fullName: string
  phone: string
  type: UserType
  createdAt: string

  auth?: AuthAccount
  staff?: Staff
  stores?: Store[]
  admin?: Admin
  // orders: Order[]
  refreshSessions?: RefreshSession[]
}


export interface AuthAccount {
  id: string
  userId: string
  login: string   // e.g. email or username or phone
  passwordHash: string
  isActive: boolean
  lastLoginAt: string
  createdAt: string
  user: User
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
  // warehouses: Warehouse[]
  // orders:     Order[]
}

export interface Staff {
  id: string
  userId: string
  storeId: string
  role: StaffRole
  isActive: Boolean
  user: User
  store: Store
  warehouses: StaffWarehouse[]
  // stockMoves: StockMovement[]
  // orders: Order[]

}

export interface StaffWarehouse {
  id: string
  staffId: string
  warehouseId: string
  staff: Staff
  // warehouse: Warehouse
}

export interface UserCreateRequest {
  fullName: string
  phone: string
  login: string
  password: string
  role: string
  isActive: boolean
  type: UserType
}

export interface UsersResponse {
  currentPage: number
  pageSize: number
  total: number
  data: User[]
}
export interface UserErrorResponse {
  statusCode: number
  message: string
  error: string
}
