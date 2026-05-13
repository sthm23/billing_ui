import { Routes } from "@angular/router";
import { PaymentList } from "./list/list";


export default [
  { path: 'list', component: PaymentList },
  { path: ':id', loadComponent: () => import('./payment-by-id/payment-by-id').then(m => m.PaymentById) }
] as Routes;
