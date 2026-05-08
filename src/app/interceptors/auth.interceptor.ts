import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // List of endpoints that should NOT have an Authorization header
  // (e.g., login, register, or public assets)
  const publicEndpoints = [
    '/api/users/login',
    '/api/users/register'
  ];

  // Check if the current request URL matches any of the public endpoints
  const isPublicRequest = publicEndpoints.some(url => req.url.includes(url));

  // If it's a login or register request, send it exactly as is (like Postman)
  if (isPublicRequest) {
    return next(req);
  }

  // For all other requests, grab the token from localStorage
  const token = localStorage.getItem('token'); 

  // If a token exists, clone the request and add the Bearer header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // If no token and not a public route, just proceed (or handle as needed)
  return next(req);
};