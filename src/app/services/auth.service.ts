import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api/users';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<string> {
    return this.http.post(this.apiUrl + '/login', credentials, { responseType: 'text' }).pipe(
      tap(token => {
        if (token) {
          localStorage.setItem('token', token);
          this.decodeTokenAndRedirect(token);
        }
      })
    );
  }

  signup(userData: any): Observable<any> {
    return this.http.post(this.apiUrl + '/createUser', userData);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/lander']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private decodeTokenAndRedirect(token: string) {
    // Simple decoding of JWT to get role (assuming role is in payload)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role; // Adjust based on actual JWT structure
      
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
    } catch (e) {
      console.error('Error decoding token', e);
      this.router.navigate(['/lander']);
    }
  }
}
