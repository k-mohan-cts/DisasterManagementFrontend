import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError, map } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api/users';
  private citizenApiUrl = 'http://localhost:8082/api/citizens';
  private documentApiUrl = 'http://localhost:8082/api/documents';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/login', credentials).pipe(
      tap((response: any) => {
        const token = response?.token;
        const user = response?.user;

        if (token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', token);

          if (user && typeof user === 'object') {
            localStorage.setItem('user', JSON.stringify(user));

            if (user.citizenId !== undefined && user.citizenId !== null) {
              localStorage.setItem('citizenId', String(user.citizenId));
            }

            if (user.userId !== undefined && user.userId !== null) {
              localStorage.setItem('userId', String(user.userId));
            }

            if (user.email) {
              localStorage.setItem('userEmail', String(user.email));
            }
          }

          this.decodeTokenAndRedirect(token, user);
        }
      })
    );
  }

  signup(userData: any): Observable<any> {
    const role = (userData?.role || userData?.userType || '').toString().toUpperCase();
    const signupUrl = role === 'CITIZEN'
      ? this.citizenApiUrl + '/createCitizen'
      : this.apiUrl + '/createUser';

    return this.http.post(signupUrl, userData);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('citizenId');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      sessionStorage.clear();
    }
    this.router.navigate(['/lander']);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = window.localStorage.getItem('token');
      return token && token.trim() ? token : null;
    }
    return null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // Validate token is a proper JWT (has 3 parts separated by dots)
    return this.isValidJWT(token);
  }

  private isValidJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      // Try to decode payload to ensure it's valid
      JSON.parse(atob(parts[1]));
      return true;
    } catch (error) {
      console.error('Invalid JWT token:', error);
      return false;
    }
  }

  private getRoleFromToken(): string | null {
    try {
      const token = this.getToken();
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check various possible role field names in the JWT
      return payload?.role || payload?.roles?.[0] || payload?.userRole || null;
    } catch (error) {
      return null;
    }
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    // First try user object, then fall back to JWT token
    return user?.role || this.getRoleFromToken();
  }

  getStoredUserRole(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user?.role) {
            return user.role;
          }
        }
      } catch (error) {
        console.error('Error parsing stored user for role:', error);
      }
    }
    // Fallback to JWT role if localStorage user doesn't have role
    return this.getRoleFromToken();
  }

  getUserId(): number | null {
    // First check localStorage (from signup response)
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedCitizenId = window.localStorage.getItem('citizenId');
      if (storedCitizenId && Number(storedCitizenId) > 0) {
        return Number(storedCitizenId);
      }
    }

    // Fallback to JWT token
    const user = this.getCurrentUser();
    return user?.userId || user?.id || null;
  }

  getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user?.email || user?.sub || null;
  }

  getCurrentUser(): any | null {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          localStorage.removeItem('user');
        }
      }
    }

    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }

  getVerificationStatus(): string | null {
    const user = this.getCurrentUser();
    return user?.verificationStatus || null;
  }

  isVerified(): boolean {
    return this.getVerificationStatus() === 'VERIFIED';
  }

  isPendingVerification(): boolean {
    const status = this.getVerificationStatus();
    return status === 'PENDING' || status === 'REJECTED';
  }

  getUserIdByEmail(email?: string | null): Observable<number | null> {
    const resolvedEmail = email || this.getUserEmail();
    if (!resolvedEmail) {
      return of(null);
    }

    const requestUrl = `${this.apiUrl}/getUserIdByEmail?email=${encodeURIComponent(resolvedEmail)}`;
    return this.http.get<any>(requestUrl).pipe(
      map((response: any) => {
        if (typeof response === 'number') {
          return response;
        }

        if (typeof response === 'string' && response.trim() !== '' && !Number.isNaN(Number(response))) {
          return Number(response);
        }

        if (response && typeof response === 'object') {
          return response.userId || response.id || response.data?.userId || response.data?.id || null;
        }

        return null;
      }),
      catchError((error) => {
        console.error('Error resolving user id by email', error);
        return of(null);
      })
    );
  }

  getResolvedUserId(): Observable<number | null> {
    return this.getUserIdByEmail();
  }

  uploadDocumentForVerification(documentData: any): Observable<any> {
    return this.http.post<any>(this.documentApiUrl + '/upload', documentData);
  }

  private decodeTokenAndRedirect(token: string, user?: any) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = user?.role || payload.role;
      const verificationStatus = user?.verificationStatus || payload.verificationStatus;

      if (role === 'CITIZEN' && (verificationStatus === 'PENDING' || verificationStatus === 'REJECTED')) {
        this.router.navigate(['/verification']);
        return;
      }

      switch (role) {
        case 'MANAGER':
          this.router.navigate(['/manager-dashboard']);
          break;
        case 'OFFICER':
          this.router.navigate(['/officer-dashboard']);
          break;
        case 'AUDITOR':
          this.router.navigate(['/auditor-dashboard']);
          break;
        case 'CITIZEN':
          this.router.navigate(['/citizen-dashboard']);
          break;
        default:
          this.router.navigate(['/lander']);
      }
    } catch (error) {
      this.router.navigate(['/lander']);
    }
  }
}
