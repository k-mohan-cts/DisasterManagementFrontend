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
    passwordHash: '',
    role: 'CITIZEN',
    status: 'ACTIVE'
  };

  constructor(private authService: AuthService, private router: Router) {}

  handleSignup() {
    this.authService.signup(this.userData).subscribe({
      next: (res) => {
        alert("Signup successful! Please login.");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Signup failed', err);
        alert("Signup failed. Please try again.");
      }
    });
  }
}
