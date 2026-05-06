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
  private shelterUrl = 'http://localhost:8082/api/shelters'; 

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

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

  // --- ADDED: Method to fix TS2339 in auth.guard.ts ---
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || null;
    } catch (e) {
      return null;
    }
  }

  getAllShelters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.shelterUrl}/getShelters`);
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

  private decodeTokenAndRedirect(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;
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
}