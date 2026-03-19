import { Routes } from '@angular/router';
import { Profile } from './profile/profile';

export default [
  { path: 'profile', component: Profile },
  { path: 'profile/:id', component: Profile },
  { path: 'attribute', loadChildren: () => import('./attribute/attribute.routes').then(m => m.default) },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
