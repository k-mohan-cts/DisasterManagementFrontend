import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-manager-emergencies',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './emergencies.component.html',
  styleUrls: ['./emergencies.component.css', '../manager-shared.css']
})
export class EmergenciesComponent implements OnInit {
  emergencies: any[] = [];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.loadEmergencies();
  }

  loadEmergencies() {
    this.disasterService.getEmergencies().subscribe({
      next: (data) => {
        this.emergencies = data;
      }
    });
  }

  updateStatus(id: number, status: string) {
    // Assuming a method updateReportStatus exists in DisasterService
    this.disasterService.updateEmergencyStatus(id, status).subscribe({
      next: () => {
        alert('Status updated to ' + status);
        this.loadEmergencies();
      }
    });
  }
}
