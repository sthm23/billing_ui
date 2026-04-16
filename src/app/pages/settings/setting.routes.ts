import { Routes } from '@angular/router';

export default [
  { path: 'attribute', loadChildren: () => import('./attribute/attribute.routes').then(m => m.default) },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
