import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  userData = {
    name: '',
    gender: 'MALE',
    dob: '',
    phone: '',
    email: '',
    address: '',
    password: '',
    role: 'CITIZEN',
    status: 'ACTIVE'
  };

  maxDate: string = '';
  minDate: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.setDateConstraints();
  }

  setDateConstraints(): void {
    const today = new Date();
    
    // Max date is today (no future dates)
    this.maxDate = today.toISOString().split('T')[0];
    
    // Min date is one year ago from today
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    this.minDate = oneYearAgo.toISOString().split('T')[0];
  }

  handleSignup() {
    this.authService.signup(this.userData).subscribe({
      next: (res) => {
        alert("Signup successful! Proceeding to document verification.");
        // Auto-login the user with the response token if available
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        
        // Store citizenId if available in response
        if (res.citizenId) {
          localStorage.setItem('citizenId', res.citizenId.toString());
        } else if (res.id) {
          localStorage.setItem('citizenId', res.id.toString());
        }
        
        // Navigate to document verification page
        this.router.navigate(['/document-verification']);
      },
      error: (err) => {
        console.error('Signup failed', err);
        
        // Extract detailed error message from response
        let errorMessage = "Signup failed. Please try again.";
        
        // Check for field-level validation details (most user-friendly)
        if (err.error && err.error.details && typeof err.error.details === 'object') {
          const fieldErrors = err.error.details;
          const errorMessages = Object.values(fieldErrors).filter(msg => msg);
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('\n');
          }
        } else if (err.error && err.error.detail) {
          errorMessage = err.error.detail;
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        alert(errorMessage);
      }
    });
  }
}
