import { Routes } from '@angular/router';
import { UserList } from './user-list/user-list';
import { UserCreate } from './user-create/user-create';
import { UserView } from './user-view/user-view';

export default [
  { path: 'list', component: UserList },
  { path: 'create', component: UserCreate },
  { path: ':id', component: UserView },
] as Routes;
