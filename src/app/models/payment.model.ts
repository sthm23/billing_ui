import { User, UserRole } from "./user.model"


export interface Payment {

  id: string
  sellerId: string
  seller: {
    role: UserRole
    user: User
  }
  status: CashboxStatus
  storeId: string
  transactions: PaymentTransaction[]
  warehouseId: string
  balance: number;
  createdAt: string;
}

export enum CashboxStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  createdAt: string;
  orderId: string;
  paymentId: string;
  type: 'PAYMENT' | 'REFUND';
}
