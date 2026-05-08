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

  // Check if user is logged in AND token is valid
  if (!authService.isLoggedIn()) {
    console.warn('User not logged in or token is invalid');
    router.navigate(['/login']);
    return false;
  }

  const userRole = authService.getUserRole();
  const expectedRole = route.data['role'];

  // If route requires specific role, validate it
  if (expectedRole && userRole !== expectedRole) {
    console.warn(`User role '${userRole}' does not match expected role '${expectedRole}'`);
    router.navigate(['/lander']);
    return false;
  }

  return true;
};
