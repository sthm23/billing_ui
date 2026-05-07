import { Routes } from '@angular/router';
import { UserList } from './user-list/user-list';
import { UserCreate } from './user-create/user-create';

export default [
  { path: 'list', component: UserList },
  { path: 'create', component: UserCreate },
] as Routes;
