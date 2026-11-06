import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../pages/auth/service/auth';

/** Rental screens only for a store with rental enabled (UX — the backend answers RENTAL_DISABLED anyway). */
export const rentalEnabledGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isRentalEnabled() ? true : authService.redirectToOrder();
};
