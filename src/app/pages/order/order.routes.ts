import { Routes } from "@angular/router";
import { OrderList } from "./order-list/order-list";
import { OrderCreate } from "./order-create/order-create";
import { OrderId } from "./order-id/order-id";


export default [
  { path: 'list', component: OrderList },
  { path: 'create', component: OrderCreate },
  { path: ':id', component: OrderId },
] as Routes;
