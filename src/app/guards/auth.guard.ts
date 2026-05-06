import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; 
  }

  if (authService.isLoggedIn()) {
    const userRole = authService.getUserRole();
    const expectedRole = route.data['role'];

    // If the route has a required role and user doesn't match, block access
    if (expectedRole && userRole !== expectedRole) {
      router.navigate(['/lander']);
      return false;
    }
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};