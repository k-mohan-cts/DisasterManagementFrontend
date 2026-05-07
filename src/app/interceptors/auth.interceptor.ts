import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // This grabs the token from storage, acting like the 'Auth' tab in Postman
  const token = localStorage.getItem('token'); 

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq).pipe(
      catchError(error => {
        console.error('HTTP error:', error);
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