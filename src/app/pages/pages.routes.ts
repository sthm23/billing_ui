import { Routes } from '@angular/router';
import { Empty } from './empty/empty';

export default [
  { path: 'empty', component: Empty },
  { path: 'product', loadChildren: () => import('./product/product.routes') },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
