import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../pages/auth/service/auth';
import { inject } from '@angular/core';

export const isLoginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const isLoggedIn = authService.getAccessToken() !== null;

  if (!isLoggedIn) {
    authService.redirectToLogin();
    return false;
  } else {
    return true;
  }
};
