import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() role: string = 'CITIZEN';
  
  userName: string = 'User';
  userAvatar: string = 'U';

  constructor(private authService: AuthService) {
    // In a real app, you'd get this from the token or a user service
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.sub || 'User';
        this.userAvatar = this.userName.charAt(0).toUpperCase();
        this.role = payload.role || 'CITIZEN';
      } catch (e) {}
    }
  }

  logout() {
    this.authService.logout();
  }
}
