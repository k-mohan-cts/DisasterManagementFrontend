import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DisasterService } from '../../../../services/disaster.service';

// 1. IMPORT THE SIDEBAR COMPONENT HERE
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-add-shelter',
  standalone: true,
  // 2. ADD SIDEBAR COMPONENT TO THE IMPORTS ARRAY
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './add-shelter.component.html',
  styleUrls: ['./add-shelter.component.css']
})
export class AddShelterComponent implements OnInit {
  isSubmitting: boolean = false;
  submitError: string = '';
  isEditMode: boolean = false;
  editId: number | null = null;

  // Initialized with 1 because Java @Positive validation rejects 0
  newShelter: any = {
    name: '',
    status: 'OPEN',
    location: '',
    capacity: 1, 
    occupancy: 1, 
    latitude: 0.0,
    longitude: 0.0,
    contactInfo: ''
  };

  constructor(
    private disasterService: DisasterService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.editId = Number(params['id']);
        this.loadExistingShelter(this.editId);
      }
    });
  }

  loadExistingShelter(id: number) {
    this.disasterService.getShelters().subscribe({
      next: (data: any[]) => {
        const existing = data.find(s => s.shelterId === id || s.id === id);
        if (existing) {
          this.newShelter = {
            name: existing.name,
            status: existing.status || 'OPEN',
            location: existing.location,
            capacity: existing.capacity || 1,
            occupancy: existing.occupancy || 1,
            latitude: existing.latitude || 0.0,
            longitude: existing.longitude || 0.0,
            contactInfo: existing.contactInfo || ''
          };
        }
      }
    });
  }

  onSubmit() {
    this.submitError = '';

    if (!this.newShelter.name || !this.newShelter.location || !this.newShelter.contactInfo) {
      this.submitError = 'Name, Location, and Contact Info are required.';
      return;
    }

    this.isSubmitting = true;

    // Formatting strictly matching Java ShelterRequestDTO
    const payload: any = {
      name: this.newShelter.name,
      location: this.newShelter.location,
      status: String(this.newShelter.status).toUpperCase(), // Transforms 'UnderMaintenance' to 'UNDERMAINTENANCE'
      capacity: Number(this.newShelter.capacity),
      occupancy: Number(this.newShelter.occupancy),
      latitude: Number(this.newShelter.latitude),
      longitude: Number(this.newShelter.longitude),
      contactInfo: this.newShelter.contactInfo
    };

    if (this.isEditMode && this.editId) {
      payload.shelterId = this.editId;
      this.disasterService.updateShelter(this.editId, payload).subscribe(this.handleResponse());
    } else {
      this.disasterService.createShelter(payload).subscribe(this.handleResponse());
    }
  }

  // Shared response handler for both Update and Create
  handleResponse() {
    return {
      next: (res: any) => {
        this.isSubmitting = false;
        this.router.navigate(['/shelters']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        if (err.status === 200 || err.status === 201) {
          this.router.navigate(['/shelters']);
          return;
        }
        console.error('API Error:', err);
        if (err.status === 400) {
          this.submitError = 'Validation Error (400): Ensure Occupancy > 0 and Email contains "@".';
        } else {
          this.submitError = `Failed to save (Status ${err.status}). Check backend logs.`;
        }
      }
    };
  }
}