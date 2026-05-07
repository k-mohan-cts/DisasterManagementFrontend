import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-manager-emergencies',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterModule],
  templateUrl: './emergencies.component.html',
  styleUrls: ['./emergencies.component.css']
})
export class EmergenciesComponent implements OnInit {
  emergencies: any[] = [];
  isLoading: boolean = true;

  constructor(
    private disasterService: DisasterService,
    public router: Router 
  ) {}

  ngOnInit(): void {
    this.loadEmergencies();
  }

  loadEmergencies(): void {
    this.isLoading = true;
    this.disasterService.getEmergencies().subscribe({
      next: (data: any) => {
        // Handle different API response structures
        if (Array.isArray(data)) {
          this.emergencies = data;
        } else if (data?.content) {
          this.emergencies = data.content; 
        } else if (data?.reports) {
          this.emergencies = data.reports; 
        } else {
          this.emergencies = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading emergencies:', err);
        this.isLoading = false;
        this.emergencies = [];
      }
    });
  }

  onStatusChange(id: number, event: any): void {
    const newStatus = event.target.value;
    this.disasterService.updateEmergencyStatus(id, newStatus).subscribe({
      next: () => this.loadEmergencies(),
      error: (err) => console.error('Status update failed:', err)
    });
  }

  navigateToCreateIncident(emergency: any): void {
    this.router.navigate(['/incidents'], { 
      state: { emergencyData: emergency } 
    });
  }

  viewDetails(emergency: any): void {
    console.log("Viewing details for:", emergency);
  }
}