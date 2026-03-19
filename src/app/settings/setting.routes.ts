import { Routes } from '@angular/router';
import { Profile } from './profile/profile';

export default [
  { path: 'profile', component: Profile },
  { path: 'profile/:id', component: Profile },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
