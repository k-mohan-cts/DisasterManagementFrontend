import { Component } from '@angular/core';
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
export class SignupComponent {
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

  constructor(private authService: AuthService, private router: Router) {}

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
        alert("Signup failed. Please try again.");
      }
    });
  }
}
