import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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
    return this.http.post(this.citizenApiUrl + '/createCitizen', userData);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }

    this.router.navigate(['/lander']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (e) {
      return null;
    }
  }

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

  private decodeTokenAndRedirect(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
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
      }
    } catch (e) {
      this.router.navigate(['/lander']);
    }
  }

  getDocumentApiUrl(userData: any): Observable<any> {
    return this.http.post<any>(this.documentApiUrl + '/upload', userData);  
  }
}