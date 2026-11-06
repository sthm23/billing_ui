import { Routes } from '@angular/router';

export default [
  { path: 'list', loadComponent: () => import('./rental-list/rental-list').then((m) => m.RentalList) },
  { path: 'create', loadComponent: () => import('./rental-form/rental-form').then((m) => m.RentalForm) },
  { path: 'calendar', loadComponent: () => import('./rental-calendar/rental-calendar').then((m) => m.RentalCalendar) },
  { path: ':id/edit', loadComponent: () => import('./rental-form/rental-form').then((m) => m.RentalForm) },
  { path: ':id', loadComponent: () => import('./rental-view/rental-view').then((m) => m.RentalView) },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
] as Routes;
