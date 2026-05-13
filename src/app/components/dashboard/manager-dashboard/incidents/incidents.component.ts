// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { DisasterService } from '../../../../services/disaster.service';
// import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

// @Component({
//   selector: 'app-incidents',
//   standalone: true,
//   imports: [CommonModule, FormsModule, SidebarComponent],
//   templateUrl: './incidents.component.html',
//   styleUrls: ['./incidents.component.css']
// })
// export class IncidentsComponent implements OnInit {
//   incidents: any[] = [];
//   reports: any[] = [];
//   officers: any[] = [
//     { userId: 1, name: 'Officer Pawan Kumar' },
//     { userId: 2, name: 'Officer Sneha K. R.' },
//     { userId: 3, name: 'Officer Akhil' }
//   ];

//   showCreateModal = false;
//   showEditModal = false;
//   selectedIncident: any = null;
//   statusUpdateValue = '';

//   newIncident = {
//     reportId: null as number | null,
//     officerId: null as number | null,
//     status: 'OPEN',
//     actions: '',
//     description: '',
//     longitude: 0.0,
//     latitude: 0.0
//   };

//   constructor(private disasterService: DisasterService) {}

//   ngOnInit(): void {
//     this.loadIncidents();
//     this.loadEmergencyReports();
//   }

//   loadIncidents(): void {
//     this.disasterService.getIncidents().subscribe({
//       next: (data: any) => { this.incidents = Array.isArray(data) ? data : (data.content || []); },
//       error: (err) => console.error('Failed to load incidents', err)
//     });
//   }

//   loadEmergencyReports(): void {
//     this.disasterService.getEmergencies().subscribe({
//       next: (data: any) => { this.reports = Array.isArray(data) ? data : (data.content || []); },
//       error: (err) => console.error('Failed to load reports', err)
//     });
//   }

//   // --- CREATE LOGIC (Kept exactly as you provided) ---
//   submitCreateIncident(): void {
//     if (!this.newIncident.reportId || !this.newIncident.officerId || !this.newIncident.actions.trim()) {
//       alert("Please complete all required fields (Report, Officer, and Actions).");
//       return;
//     }
//     const payload = {
//       ...this.newIncident,
//       reportId: Number(this.newIncident.reportId),
//       officerId: Number(this.newIncident.officerId)
//     };
//     this.disasterService.createIncident(payload).subscribe({
//       next: () => {
//         alert("Incident Created Successfully!");
//         this.closeCreateModal();
//         this.loadIncidents();
//       },
//       error: (err) => {
//         alert(err.error?.message || 'Server error: Ensure report is VALIDATED.');
//       }
//     });
//   }

//   // --- UPDATE & DELETE LOGIC ---
//   openEditModal(incident: any) {
//     this.selectedIncident = incident;
//     this.statusUpdateValue = incident.status;
//     this.showEditModal = true;
//   }

//   submitStatusUpdate() {
//     this.disasterService.updateIncidentStatus(this.selectedIncident.incidentId, this.statusUpdateValue).subscribe({
//       next: () => {
//         alert("Status Updated!");
//         this.showEditModal = false;
//         this.loadIncidents();
//       },
//       error: (err) => alert("Update failed")
//     });
//   }

//   deleteIncident(id: number) {
//     if (confirm(`Confirm deletion of INC-${id}?`)) {
//       this.disasterService.deleteIncident(id).subscribe({
//         next: (res) => { alert(res); this.loadIncidents(); },
//         error: (err) => alert(`Delete failed: ${err.status}`)
//       });
//     }
//   }

//   openCreateModal() { this.showCreateModal = true; this.loadEmergencyReports(); }
//   closeCreateModal() { this.showCreateModal = false; this.resetForm(); }
//   resetForm() {
//     this.newIncident = { reportId: null, officerId: null, status: 'OPEN', actions: '', description: '', longitude: 0.0, latitude: 0.0 };
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DisasterService } from '../../../../services/disaster.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.css']
})
export class IncidentsComponent implements OnInit {
  incidents: any[] = [];
  reports: any[] = [];
  officers: any[] = []; // Now dynamic

  showCreateModal = false;
  showEditModal = false;
  selectedIncident: any = null;
  statusUpdateValue = '';

  newIncident = {
    reportId: null as number | null,
    officerId: null as number | null,
    status: 'OPEN',
    actions: '',
    description: '',
    longitude: 0.0,
    latitude: 0.0
  };

  constructor(private disasterService: DisasterService) {}

  ngOnInit(): void {
    this.loadIncidents();
    this.loadEmergencyReports();
    this.loadOfficers(); // Initial fetch
  }

  // NEW: Populate the officer list from backend
  loadOfficers(): void {
  this.disasterService.getAllUsers().subscribe({
    next: (data: any[]) => {
      // Based on the JSON you shared, we filter to show only Officers
      // This prevents 'Khoushik' (CITIZEN) from showing in the dropdown
      this.officers = data.filter(user => user.role === 'OFFICER');
    },
    error: (err) => {
      console.error('Failed to load officers', err);
      // If you still see a 401 error here, check if your 'token' 
      // is actually stored in localStorage.
    }
  });
}

  loadIncidents(): void {
    this.disasterService.getIncidents().subscribe({
      next: (data: any) => { this.incidents = Array.isArray(data) ? data : (data.content || []); },
      error: (err) => console.error('Failed to load incidents', err)
    });
  }

  loadEmergencyReports(): void {
    this.disasterService.getEmergencies().subscribe({
      next: (data: any) => { this.reports = Array.isArray(data) ? data : (data.content || []); },
      error: (err) => console.error('Failed to load reports', err)
    });
  }

  submitCreateIncident(): void {
    if (!this.newIncident.reportId || !this.newIncident.officerId || !this.newIncident.actions.trim()) {
      alert("Please complete all required fields (Report, Officer, and Actions).");
      return;
    }
    const payload = {
      ...this.newIncident,
      reportId: Number(this.newIncident.reportId),
      officerId: Number(this.newIncident.officerId)
    };
    this.disasterService.createIncident(payload).subscribe({
      next: () => {
        alert("Incident Created Successfully!");
        this.closeCreateModal();
        this.loadIncidents();
      },
      error: (err) => {
        const apiError = err?.error;
        const validation = apiError?.message;

        if (validation && typeof validation === 'object') {
          const lines = Object.entries(validation).map(([key, value]) => `${key}: ${value}`);
          alert(lines.join('\n'));
          return;
        }

        alert(validation || apiError?.error || apiError?.message || 'Server error: Ensure report is VALIDATED.');
      }
    });
  }

  openEditModal(incident: any) {
    this.selectedIncident = incident;
    this.statusUpdateValue = incident.status;
    this.showEditModal = true;
  }

  submitStatusUpdate() {
    this.disasterService.updateIncidentStatus(this.selectedIncident.incidentId, this.statusUpdateValue).subscribe({
      next: () => {
        alert("Status Updated!");
        this.showEditModal = false;
        this.loadIncidents();
      },
      error: (err) => alert("Update failed")
    });
  }

  deleteIncident(id: number) {
    if (confirm(`Confirm deletion of INC-${id}?`)) {
      this.disasterService.deleteIncident(id).subscribe({
        next: (res) => { alert(res); this.loadIncidents(); },
        error: (err) => alert(`Delete failed: ${err.status}`)
      });
    }
  }

  openCreateModal() { this.showCreateModal = true; this.loadEmergencyReports(); }
  closeCreateModal() { this.showCreateModal = false; this.resetForm(); }
  resetForm() {
    this.newIncident = { reportId: null, officerId: null, status: 'OPEN', actions: '', description: '', longitude: 0.0, latitude: 0.0 };
  }
}