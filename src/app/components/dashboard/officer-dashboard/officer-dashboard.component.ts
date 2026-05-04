import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div style="display: flex;">
      <app-sidebar role="OFFICER"></app-sidebar>
      <div style="flex: 1; padding: 20px;">
        <h1>Officer Dashboard</h1>
        <p>Welcome, Relief Officer. Here you can manage relief inventory, distributions, and shelters.</p>
      </div>
    </div>
  `
})
export class OfficerDashboardComponent {}
