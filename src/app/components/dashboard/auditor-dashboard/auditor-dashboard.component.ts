import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div style="display: flex;">
      <app-sidebar role="AUDITOR"></app-sidebar>
      <div style="flex: 1; padding: 20px;">
        <h1>Auditor Dashboard</h1>
        <p>Welcome, Auditor. Here you can monitor compliance records and audit logs.</p>
      </div>
    </div>
  `
})
export class AuditorDashboardComponent {}
