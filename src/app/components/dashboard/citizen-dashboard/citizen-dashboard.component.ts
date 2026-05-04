import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../services/disaster.service';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './citizen-dashboard.component.html',
  styleUrl: './citizen-dashboard.component.css'
})
export class CitizenDashboardComponent implements OnInit {
  reports: any[] = [
    { type: 'Medical Emergency', date: 'Oct 24, 2023', status: 'VALIDATED' },
    { type: 'Flood Alert', date: 'Oct 15, 2023', status: 'RESOLVED' }
  ];

  shelters: any[] = [
    { name: 'Central Community Hall', capacity: 85, color: '#14b8a6' },
    { name: 'North Secondary School', capacity: 42, color: '#3b82f6' }
  ];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.disasterService.getEmergencies().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.reports = data.map(r => ({
            type: r.type || 'Emergency',
            date: new Date(r.reportDate).toLocaleDateString(),
            status: r.status || 'PENDING'
          }));
        }
      },
      error: (err) => console.error('Error fetching emergencies', err)
    });

    this.disasterService.getShelters().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.shelters = data.map(s => ({
            name: s.name,
            capacity: Math.floor(Math.random() * 100), // Dummy capacity for now
            color: '#14b8a6'
          }));
        }
      },
      error: (err) => console.error('Error fetching shelters', err)
    });
  }
}
