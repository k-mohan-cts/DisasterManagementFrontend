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

  constructor(private authService: AuthService, private router: Router) {}

  handleLogin() {
    if (!this.credentials.email || !this.credentials.passwordHash) {
      alert("Please enter both email and password.");
      return;
    }

    this.authService.login(this.credentials).subscribe({
      next: (token) => {
        // Redirect logic is handled in AuthService
      },
      error: (err) => {
        console.error('Login failed', err);
        alert("Login failed. Please check your credentials.");
      }
    });
  }
}
