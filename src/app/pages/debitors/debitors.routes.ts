import { Routes } from "@angular/router";
import { DebitorList } from "./list/list";
import { Home } from "./home/home";


export default [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list', component: Home, children: [
      { path: '', component: DebitorList },
      { path: 'old', loadComponent: () => import('./old-debitor-sheet/old-debitor-sheet').then(m => m.OldDebitorSheet) },
    ],
  },
  { path: 'create', loadComponent: () => import('./old-debt-create/old-debt-create').then(m => m.OldDebtCreate) },
  { path: ':id', loadComponent: () => import('./old-debt-by-id/old-debt-by-id').then(m => m.OldDebtById) },
] as Routes;
