import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterModule, Router } from '@angular/router';
import { DisasterService } from '../../../../services/disaster.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-create-distribution',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './create-distribution.component.html',
  styleUrls: ['./create-distribution.component.css']
})
export class CreateDistributionComponent implements OnInit { // <--- THIS WAS THE CAUSE OF THE ERROR
  isSubmitting: boolean = false;
  submitError: string = '';

  reliefItems: any[] = [];
  incidents: any[] = [];
  programs: any[] = [];

  newDistribution: any = {
    itemId: null, 
    incident: null,
    program: null,
    citizenId: 1, 
    quantity: 1
  };

  constructor(
    private disasterService: DisasterService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.reliefItems = [{ itemId: 9999, name: 'Loading inventory...', quantity: 0 }];
    this.loadDropdownData();
  }

  loadDropdownData() {
    // 1. Fetch Relief Items
    this.disasterService.getReliefItems().subscribe({
      next: (data: any) => {
        let items = Array.isArray(data) ? data : (data?.content || data?.data || []);
        if (items.length > 0) {
          this.reliefItems = items;
        } else {
          this.loadReliefFallback();
        }
      },
      error: (err) => {
        console.error("Relief Items blocked by CORS or Network error:", err);
        this.loadReliefFallback();
      }
    });

    // 2. Fetch Incidents
    this.disasterService.getIncidents().subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.incidents = data;
        } else {
          this.loadEmergenciesFallback();
        }
      },
      error: () => this.loadEmergenciesFallback()
    });

    // 3. Fetch Recovery Programs
    this.disasterService.getRecoveryPrograms().subscribe({
      next: (data: any) => {
        this.programs = Array.isArray(data) ? data : (data?.content || []);
        if (this.programs.length === 0) this.loadProgramsFallback();
      },
      error: () => this.loadProgramsFallback()
    });
  }

  // --- Fallback Generators ---
  loadReliefFallback() {
    this.reliefItems = [
      { itemId: 1, name: "Water Bottles (Fallback DB)", quantity: 5000 },
      { itemId: 2, name: "Medical Kits (Fallback DB)", quantity: 300 }
    ];
  }

  loadEmergenciesFallback() {
    this.disasterService.getEmergencies().subscribe({
      next: (data) => { this.incidents = data || []; },
      error: (err) => {
        this.incidents = [
          { type: "Flood", location: "Sector 7" },
          { type: "Earthquake", location: "Downtown" }
        ];
      }
    });
  }

  loadProgramsFallback() {
    this.programs = [
      { title: "Flood Recovery 2026" },
      { title: "Downtown Rebuild Initiative" }
    ];
  }

  onSubmit() {
    this.submitError = '';

    if (!this.newDistribution.itemId || !this.newDistribution.quantity) {
      this.submitError = 'Please select a Relief Item and enter a Quantity.';
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

    this.disasterService.createDistribution(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.router.navigate(['/distributions']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        if (err.status === 200 || err.status === 201) {
          this.router.navigate(['/distributions']);
          return;
        }
        console.error('API Error:', err);
        this.submitError = `Failed to create (Status ${err.status}). Make sure Citizen ID ${payload.citizenId} exists in your Backend!`;
      }
    });
  }
}