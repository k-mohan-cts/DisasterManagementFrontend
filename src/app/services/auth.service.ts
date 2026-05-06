import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError, map } from 'rxjs';
=======
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api/users';
<<<<<<< HEAD
=======
  private citizenApiUrl = 'http://localhost:8082/api/citizens';
  private documentApiUrl = 'http://localhost:8082/api/documents';
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2

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
<<<<<<< HEAD
    return this.http.post(this.apiUrl + '/createUser', userData);
=======
    return this.http.post(this.citizenApiUrl + '/createCitizen', userData);
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
<<<<<<< HEAD
=======

>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
    this.router.navigate(['/lander']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
<<<<<<< HEAD
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const payload = this.getTokenPayload();
    return payload?.role || null;
  }

  getUserId(): number | null {
    const payload = this.getTokenPayload();
    return payload?.userId || payload?.id || null;
  }

  getUserEmail(): string | null {
    const payload = this.getTokenPayload();
    return payload?.email || payload?.sub || null;
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

  private getTokenPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
=======
    return this.getToken() !== null;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
    } catch (e) {
      return null;
    }
  }

<<<<<<< HEAD
=======
  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user && user.id ? user.id : null;
  }

  getCurrentUser(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      return null;
    }
  }

  getVerificationStatus(): string | null {
    const user = this.getCurrentUser();
    return user && user.verificationStatus ? user.verificationStatus : null;
  }

  isVerified(): boolean {
    return this.getVerificationStatus() === 'VERIFIED';
  }

  isPendingVerification(): boolean {
    const status = this.getVerificationStatus();
    return status === 'PENDING' || status === 'REJECTED';
  }

>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  private decodeTokenAndRedirect(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
<<<<<<< HEAD
      
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
=======
      const verificationStatus = payload.verificationStatus;

      // Check verification status for citizens
      if (role === 'CITIZEN') {
        if (verificationStatus === 'PENDING' || verificationStatus === 'REJECTED') {
          // Redirect to verification page instead of dashboard
          this.router.navigate(['/verification']);
          return;
        }
      }

      switch (role) {
        case 'MANAGER': this.router.navigate(['/manager-dashboard']); break;
        case 'OFFICER': this.router.navigate(['/officer-dashboard']); break;
        case 'AUDITOR': this.router.navigate(['/auditor-dashboard']); break;
        case 'CITIZEN': this.router.navigate(['/citizen-dashboard']); break;
        default: this.router.navigate(['/lander']);
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
      }
    } catch (e) {
      this.router.navigate(['/lander']);
    }
  }
<<<<<<< HEAD
}
=======

  getDocumentApiUrl(userData: any): Observable<any> {
    return this.http.post<any>(this.documentApiUrl + '/upload', userData);  
  }
}
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
