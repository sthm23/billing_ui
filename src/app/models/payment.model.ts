import { Order, PaymentType } from "./order.model"
import { Staff, User, UserRole } from "./user.model"


export interface Payment {

  id: string
  sellerId: string
  seller: {
    role: UserRole
    user: User
  }
  status: CashboxStatus
  storeId: string
  transactions: CashboxTransaction[]
  warehouseId: string
  balance: number;
  createdAt: string;
}

export enum CashboxStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface CashboxTransaction {
  id: string;
  cashboxId: string
  createdById: string
  type: CashTransactionType
  category: CashTransactionCategory
  paymentType: PaymentType
  amount: number
  comment: string | null
  orderId?: string
  createdAt: string

  order?: Order
  createdBy: Staff
}
export enum CashTransactionCategory {
  SALE = 'SALE',
  DEBT_PAYMENT = 'DEBT_PAYMENT',
  RENT = 'RENT',
  DELIVERY = 'DELIVERY',
  SALARY = 'SALARY',
  PURCHASE = 'PURCHASE',
  RETURN = 'RETURN',
  OTHER = 'OTHER',
}

export enum CashTransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface CashboxOpenPayload {
  balance: number;
  status: CashboxStatus;
  storeId: string;
  warehouseId: string;
}

export interface TransactionPayload {
  type: CashTransactionType
  category: CashTransactionCategory
  paymentType: PaymentType
  amount: number
  comment: string
  orderId?: string
}
