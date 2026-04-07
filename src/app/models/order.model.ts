import { BaseListResponse } from "./app.models"
import { UserRole, UserType } from "./user.model"

export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  DEBT = 'DEBT',
  INSTALLMENT = 'INSTALLMENT' // рассрочка
}
export enum OrderChannel {
  POS = 'POS',
  ONLINE = 'ONLINE'
}

export enum OrderStatus {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
  DEBT = 'DEBT',
  HOLD = 'HOLD',
  CANCELLED = 'CANCELLED'
}

export interface OrderResponse extends BaseListResponse {
  data: Order[]
}
export interface Order {
  id: string
  store: {
    id: string
    name: string
    ownerId: string
    createdAt: string
    createdBy: string
  },
  warehouseId: string
  warehouse: {
    id: string
    storeId: string
    name: string
    isActive: true,
    createdAt: string
  },
  cashier: {
    id: string
    fullName: string
    phone: string
    role: UserRole,
    type: UserType,
    createdAt: string
  },
  customer: {
    id: string
    user: {
      fullName: string
      phone: string
      role: UserRole,
      type: UserType,
      createdAt: string
    }
  },
  channel: OrderChannel,
  status: OrderStatus,
  totalAmount: number
  paidAmount: number
  createdAt: string
  itemsCount: number
  paymentsCount: number
}

export interface OrderDetail extends Order {
  payments: OrderPayment[]
  items: OrderDetailItem[]
}

export interface OrderPayment {
  amount: number
  createdAt: string
  createdBy: string
  id: string
  orderId: string
  paidAt: string | null
  type: PaymentType
}
export interface OrderDetailItem {
  costAtSale: number
  id: string
  orderId: string
  quantity: 2
  retailPrice: number
  sale: number
  variant: {
    id: string,
    barCode: string
    price: number
    productId: string
    sku: string
    storeId: string
    quantity: number
  }
  variantId: string
}
export interface OrderItemCard {
  itemId?: string
  id: string
  name: string
  stock: number
  quantity: number
  price: number
  costAtSale: number
  sale: number
}


export interface OrderItemPayload {
  variantId: string
  quantity: number
  retailPrice: number
  sale: number
  costAtSale: number
}
export interface CreateOrderItemPayload {
  orderId: string
  customerId: string | null
  items: OrderItemPayload[]
}

export interface ReturnOrderItemPayload {
  orderId: string,
  items: Omit<OrderItemPayload, 'variantId'>[]
  payments: OrderPaymentPayload[]
}
export interface CreateOrderPayload {
  storeId: string;
  warehouseId: string
  customerId?: string
  channel: OrderChannel
}

export interface OrderPaymentPayload {
  type: PaymentType
  amount: number
  paidAt?: Date
}
export interface CreateOrderPaymentPayload {
  orderId: string
  customerId: string | null
  payments: OrderPaymentPayload[]
}
