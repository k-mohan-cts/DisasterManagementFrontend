import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './my-reports.component.html',
  styleUrl: './my-reports.component.css'
})
export class MyReportsComponent implements OnInit {
  reports: any[] = [];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.disasterService.getEmergencies().subscribe({
      next: (data) => {
        this.reports = data.map(r => ({
          id: 'REP-' + r.reportId,
          type: r.type,
          location: r.location,
          date: new Date(r.reportDate).toLocaleDateString(),
          status: r.status,
          description: r.description
        }));
      }
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }
}
