import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { NotFound } from './pages/not-found/not-found';
import { Layout } from './layout/components/layout/layout';
import { isLoginGuard } from './shared/guards/is-login-guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Dashboard },
      { path: 'pages', loadChildren: () => import('./pages/pages.routes') }
    ],
    canActivate: [isLoginGuard]
  },
  { path: 'notfound', component: NotFound },
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes') },
  { path: 'settings', loadChildren: () => import('./settings/setting.routes') },
  { path: '**', redirectTo: '/notfound' }
];
