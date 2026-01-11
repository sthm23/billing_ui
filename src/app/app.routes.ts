import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { NotFound } from './pages/not-found/not-found';
import { Layout } from './layout/components/layout/layout';

export const appRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Dashboard },
      { path: 'pages', loadChildren: () => import('./pages/pages.routes') }
    ]
  },
  { path: 'notfound', component: NotFound },
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes') },
  { path: '**', redirectTo: '/notfound' }
];
