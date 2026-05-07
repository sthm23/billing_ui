import { Routes } from "@angular/router";
import { OrderList } from "./order-list/order-list";
import { OrderId } from "./order-id/order-id";
import { CreateOrderPayment } from "./create-order-payment/create-order-payment";
import { OrderReturn } from "./order-return/order-return";


export default [
  { path: 'list', component: OrderList },
  { path: 'return/:id', component: OrderReturn },
  { path: 'payment/:id', component: CreateOrderPayment },
  { path: ':id', component: OrderId },
] as Routes;
