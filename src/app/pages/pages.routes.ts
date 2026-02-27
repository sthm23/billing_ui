import { Routes } from '@angular/router';
import { Empty } from './empty/empty';

export default [
  { path: 'empty', component: Empty },
  { path: 'product', loadChildren: () => import('./product/product.routes') },
  { path: 'user', loadChildren: () => import('./user/user.routes') },
  { path: 'organization', loadChildren: () => import('./organization/organization.routes') },
  { path: 'order', loadChildren: () => import('./order/order.routes') },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
