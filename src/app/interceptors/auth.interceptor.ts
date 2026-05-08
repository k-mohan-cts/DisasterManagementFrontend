import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // Only retrieve token in browser environment
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (token && token.trim()) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq).pipe(
      catchError(error => {
        console.error('HTTP error:', error);

        // Handle 401 Unauthorized - token may be invalid/expired
        if (error.status === 401) {
          console.warn('Unauthorized (401): Token may be expired or invalid');
          localStorage.removeItem('token');
          sessionStorage.clear();
          router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError(error => {
      console.error('HTTP error:', error);
      return throwError(() => error);
    })
  );
};
