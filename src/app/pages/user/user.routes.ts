import { Routes } from '@angular/router';
import { UserList } from './user-list/user-list';
import { UserCreate } from './user-create/user-create';
import { UserView } from './user-view/user-view';
import { OrgCreate } from '../organization/org-create/org-create';

export default [
  { path: 'list', component: UserList },
  { path: 'create', component: UserCreate },
  { path: 'view/:id', component: UserView },
  { path: 'view/:id/create-store', component: OrgCreate },
] as Routes;
