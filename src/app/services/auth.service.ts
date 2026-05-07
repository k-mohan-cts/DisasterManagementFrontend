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

  login(credentials: any): Observable<string> {
    return this.http.post(this.apiUrl + '/login', credentials, { responseType: 'text' }).pipe(
      tap(token => {
        if (token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', token);
          this.decodeTokenAndRedirect(token);
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
    }
    this.router.navigate(['/lander']);
  }

 getToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('token');
  }
  return null;
}

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.userId || user?.id || null;
  }

  getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user?.email || user?.sub || null;
  }

  getCurrentUser(): any | null {
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

  private decodeTokenAndRedirect(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
      const verificationStatus = payload.verificationStatus;

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
