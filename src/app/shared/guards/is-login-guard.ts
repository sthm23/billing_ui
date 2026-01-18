import { CanActivateFn } from '@angular/router';

export const isLoginGuard: CanActivateFn = (route, state) => {
  return true;
};
