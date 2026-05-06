import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../services/disaster.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterLink],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  activeEmergenciesCount = 1;
  activeRecoveryProgramsCount = 2;

  recentEmergencies: any[] = [
    { type: 'Flood', location: 'Riverside District', date: '1/10/2023', status: 'Validated' },
    { type: 'Fire', location: 'Pine Hills', date: '15/10/2023', status: 'Resolved' }
  ];

  activePrograms: any[] = [
    { name: 'Coastal Flood Rehabilitation', budget: '$5,000,000', status: 'Active' },
    { name: 'Downtown Earthquake Recovery', budget: '$12,000,000', status: 'Planned' }
  ];

  constructor(private disasterService: DisasterService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.disasterService.getEmergencies().subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.recentEmergencies = data.slice(0, 5).map(r => ({
              type: r.type,
              location: r.location,
              date: new Date(r.reportDate).toLocaleDateString(),
              status: r.status
            }));
            this.activeEmergenciesCount = data.filter(r => r.status === 'ACTIVE' || r.status === 'VALIDATED').length;
          }
        }
      });

      this.disasterService.getRecoveryPrograms().subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.activePrograms = data.slice(0, 5).map(p => ({
              name: p.programName,
              budget: `$${p.budget}`,
              status: p.status
            }));
            this.activeRecoveryProgramsCount = data.length;
          }
        }
      });
    }
  }
}
