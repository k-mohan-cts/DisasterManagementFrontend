import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterModule, Router } from '@angular/router';
import { DisasterService } from '../../../../services/disaster.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-create-distribution',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './create-distribution.component.html',
  styleUrls: ['./create-distribution.component.css']
})
export class CreateDistributionComponent implements OnInit {
  isSubmitting: boolean = false;
  submitError: string = '';

  reliefItems: any[] = [];
  incidents: any[] = [];
  programs: any[] = [];
  citizens: any[] = []; // NEW: Array for the citizen list

  newDistribution: any = {
    itemId: null, 
    incident: null,
    program: null,
    citizenId: null, // Initialized as null for selection
    quantity: 1
  };

  constructor(
    private disasterService: DisasterService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Ensure user has a valid token before attempting API calls
    if (!this.authService.isLoggedIn()) {
      // Let user know and redirect to login
      alert('Session expired or not authenticated. Please log in.');
      this.router.navigate(['/login']);
      return;
    }

    this.loadDropdownData();
  }

  loadDropdownData() {
    // 1. Fetch Relief Items
    this.disasterService.getReliefItems().subscribe({
      next: (data: any) => {
        let items = Array.isArray(data) ? data : (data?.content || data?.data || []);
        this.reliefItems = items.length > 0 ? items : this.getReliefFallback();
      },
      error: () => { this.reliefItems = this.getReliefFallback(); }
    });

    // 2. Fetch Incidents
    this.disasterService.getIncidents().subscribe({
      next: (data: any) => {
        this.incidents = (data && data.length > 0) ? data : [];
        if (this.incidents.length === 0) this.loadEmergenciesFallback();
      },
      error: (err) => {
        console.error('Failed to load incidents:', err);
        // If 401, prompt re-login
        if (err?.status === 401) {
          alert('Unauthorized. Please log in again.');
          this.router.navigate(['/login']);
          return;
        }
        this.loadEmergenciesFallback();
      }
    });

    // 3. Fetch Recovery Programs
    this.disasterService.getRecoveryPrograms().subscribe({
      next: (data: any) => {
        this.programs = Array.isArray(data) ? data : (data?.content || []);
      },
      error: (err) => {
        console.error('Failed to load programs:', err);
        if (err?.status === 401) {
          alert('Unauthorized. Please log in again.');
          this.router.navigate(['/login']);
          return;
        }
        this.programs = [];
      }
    });

    // 4. NEW: Fetch Citizens from Database for the Recipient list
    this.disasterService.getCitizens().subscribe({
      next: (data: any) => {
        this.citizens = Array.isArray(data) ? data : (data?.content || []);
      },
      error: (err) => {
        console.error('Failed to load citizens:', err);
        if (err?.status === 401) {
          alert('Unauthorized. Please log in again.');
          this.router.navigate(['/login']);
          return;
        }
        this.citizens = []; // Keeps list empty if database is unreachable
      }
    });
  }

  // --- Fallbacks ---
  private getReliefFallback() {
    return [
      { itemId: 1, itemName: "Water Bottles (Fallback)", quantity: 5000 },
      { itemId: 2, itemName: "Medical Kits (Fallback)", quantity: 300 }
    ];
  }

  loadEmergenciesFallback() {
    this.disasterService.getEmergencies().subscribe({
      next: (data: any) => { this.incidents = data || []; },
      error: () => {
        this.incidents = [
          { type: "Flood", location: "Sector 7" },
          { type: "Earthquake", location: "Downtown" }
        ];
      }
    });
  }

  onSubmit() {
    this.submitError = '';

    if (!this.newDistribution.itemId || !this.newDistribution.citizenId) {
      this.submitError = 'Please select a Relief Item and a Recipient Citizen.';
      return;
    }

    this.isSubmitting = true;

    const payload: any = {
      itemId: Number(this.newDistribution.itemId),
      citizenId: Number(this.newDistribution.citizenId), 
      officerId: 1, 
      quantity: Number(this.newDistribution.quantity),
      status: "PENDING",
      notes: `Incident: ${this.newDistribution.incident || 'None'} | Program: ${this.newDistribution.program || 'None'}`
    };

    // This adds the record to your Distribution table
    this.disasterService.createDistribution(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/distributions']); // Navigate to the table view
      },
      error: (err: any) => {
        this.isSubmitting = false;
        // Handle cases where Spring returns a string instead of JSON but creates the record
        if (err.status === 200 || err.status === 201) {
          this.router.navigate(['/distributions']);
          return;
        }
        this.submitError = `Error: Citizen ID ${payload.citizenId} might not be valid in the system.`;
      }
    });
  }
}