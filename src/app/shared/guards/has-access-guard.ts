import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../pages/auth/service/auth';
import { inject } from '@angular/core';

type accessRoles = 'OWNER' | 'ADMIN' | 'MANAGER';
export const hasAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const expectedRole = route.data['expectedRole'] as accessRoles[] | undefined;

  if (expectedRole && expectedRole.length > 0) {
    const hasAccess = expectedRole.some((role) => {
      if (role === 'OWNER') {
        return authService.isOwner();
      } else if (role === 'ADMIN') {
        return authService.isAdmin();
      } else if (role === 'MANAGER') {
        return authService.isManager();
      }
      return false;
    });
    return hasAccess ? true : authService.redirectToOrder();
  }
  return true;
};
