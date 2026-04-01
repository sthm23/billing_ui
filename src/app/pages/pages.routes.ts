import { Routes } from '@angular/router';

export default [
  { path: 'product', loadChildren: () => import('./product/product.routes') },
  { path: 'user', loadChildren: () => import('./user/user.routes') },
  { path: 'organization', loadChildren: () => import('./organization/organization.routes') },
  { path: 'order', loadChildren: () => import('./order/order.routes') },
  { path: 'settings', loadChildren: () => import('./settings/setting.routes') },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
