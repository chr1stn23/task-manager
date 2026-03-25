import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const publicGuard: CanActivateChildFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    router.navigate(['/tasks']);
    return false;
  }

  return true;
};
