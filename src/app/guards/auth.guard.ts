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

  // Get role from stored user first, then fall back to JWT
  const userRole = authService.getStoredUserRole() || authService.getUserRole();
  const expectedRole = route.data['role'];

  // If route requires specific role, validate it
  if (expectedRole && userRole !== expectedRole) {
      console.error(`❌ AUTH GUARD FAILED: Route ${state.url}`);
      console.error('   Expected Role:', expectedRole);
      console.error('   User Role:', userRole);
      console.error('   StoredUserRole:', authService.getStoredUserRole());
      console.error('   getUserRole():', authService.getUserRole());
    
      // Try to see what's in localStorage
      try {
        const storedUser = localStorage.getItem('user');
        console.error('   Stored User Object:', storedUser ? JSON.parse(storedUser) : 'null');
      } catch (e) {
        console.error('   Error reading localStorage.user');
      }
    router.navigate(['/lander']);
    return false;
  }

  return true;
};
