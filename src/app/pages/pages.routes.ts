import { Routes } from '@angular/router';
import { Profile } from './profile/profile';
import { hasAccessGuard } from '../shared/guards/has-access-guard';

export default [
  { path: 'profile', component: Profile },
  { path: 'profile/:id', component: Profile },
  { path: 'product', loadChildren: () => import('./product/product.routes'), data: { expectedRole: ['ADMIN', 'OWNER', 'MANAGER'] }, canActivate: [hasAccessGuard] },
  { path: 'user', loadChildren: () => import('./user/user.routes'), data: { expectedRole: ['ADMIN', 'OWNER'] }, canActivate: [hasAccessGuard] },
  { path: 'organization', loadChildren: () => import('./organization/organization.routes'), data: { expectedRole: ['ADMIN'] }, canActivate: [hasAccessGuard] },
  { path: 'order', loadChildren: () => import('./order/order.routes') },
  { path: 'settings', loadChildren: () => import('./settings/setting.routes'), data: { expectedRole: ['ADMIN'] }, canActivate: [hasAccessGuard] },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
