import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = {
    email: '',
    passwordHash: ''
  };
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  handleLogin() {
    if (!this.credentials.email || !this.credentials.passwordHash) {
      this.errorMessage = "Please enter both email and password.";
      alert(this.errorMessage);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Redirect logic is handled in AuthService
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err);

        // Handle verification pending (403) - allow user to proceed to verification page
        if (err.error?.error === 'Verification Pending') {
          alert('Verification Pending, Upload document or wait for manager approval to proceed.');
          
          // Extract user data from error response if available
          const userData = err.error?.user || err.error?.data;
          if (userData) {
            // Store user data in localStorage so verification page can access it
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('user', JSON.stringify(userData));
              if (userData.citizenId) {
                localStorage.setItem('citizenId', userData.citizenId.toString());
              }
              if (userData.userId) {
                localStorage.setItem('userId', userData.userId.toString());
              }
              if (userData.email) {
                localStorage.setItem('userEmail', userData.email);
              }
            }
          }
          
          // Navigate to verification page to continue document upload
          this.router.navigate(['/document-verification']);
          return;
        }

        // Handle other errors
        let errorMessage = 'Login failed. Please check your credentials.';
        if (err.error?.error) {
          errorMessage = err.error.error;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }
        alert(errorMessage);
      }
    });
  }
}
