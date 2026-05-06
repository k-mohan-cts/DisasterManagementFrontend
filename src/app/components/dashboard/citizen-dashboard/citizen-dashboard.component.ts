import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DisasterService } from '../../../services/disaster.service';
import { AuthService } from '../../../services/auth.service'
import { DocumentService } from '../../../services/document.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
declare let L: any;

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './citizen-dashboard.component.html',
  styleUrls: ['./citizen-dashboard.component.css']
})
export class CitizenDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  reports: any[] = [];
  shelters: any[] = [];
  showReportModal = false;
  showVerifyModal = false;
  isUserVerified = false;
  verificationStatus: string | null = null;
  map: any;
  
  newReport = {
    citizenId: 0,
    location: '',
    type: 'FIRE',
    latitude: 0,
    longitude: 0,
    description: ''
  };

  emergencyTypes = ['FLOOD', 'FIRE', 'EARTHQUAKE', 'CYCLONE', 'LANDSLIDE', 'OTHER'];

  // Document verification properties
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  verifyData = {
    name: '',
    type: 'PDF Document'
  };
  documentTypes = ['PDF Document', 'Image', 'Word Document', 'Other'];
  isUploading = false;

  serviceError = '';

  constructor(
    private disasterService: DisasterService,
    private authService: AuthService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    this.newReport.citizenId = userId || 0;
    console.log('Citizen ID:', this.newReport.citizenId);
    
    // Check verification status
    this.verificationStatus = this.authService.getVerificationStatus();
    this.isUserVerified = this.authService.isVerified();
    
    console.log('Verification Status:', this.verificationStatus);
    console.log('Is Verified:', this.isUserVerified);
    
    this.loadData();
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.newReport.latitude = position.coords.latitude;
        this.newReport.longitude = position.coords.longitude;
      });
    }
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.revokeFilePreviewUrl();
  }

  openReportModal() {
    this.showReportModal = true;
  }

  closeReportModal() {
    this.showReportModal = false;
    this.resetReportForm();
  }

  resetReportForm() {
    this.newReport = {
      citizenId: this.authService.getUserId() || 0,
      location: '',
      type: 'FIRE',
      latitude: 0,
      longitude: 0,
      description: ''
    };
  }

  loadData() {
    this.serviceError = '';

    this.disasterService.getEmergencies().subscribe({
      next: (data: any[]) => {
        this.reports = data.map((r: any) => ({
          type: r.type,
          date: new Date(r.reportDate).toLocaleDateString(),
          status: r.status
        }));
      },
      error: (err: any) => {
        console.error('Failed to load emergency reports', err);
        this.reports = [];
        this.serviceError += 'Emergency report service unavailable. ';
      }
    });

    this.disasterService.getShelters().subscribe({
      next: (data: any[]) => {
        this.shelters = data.map((s: any) => {
          const capacity = s.capacity || 0;
          const occupancy = s.occupancy || 0;
          const percentage = capacity > 0 ? (occupancy / capacity) * 100 : 0;
          let color = '#14b8a6';
          if (percentage > 85) color = '#ef4444';
          else if (percentage > 60) color = '#f59e0b';
          return {
            name: s.name || 'Unknown Shelter',
            location: s.location || 'N/A',
            capacity,
            occupancy,
            color
          };
        });
      },
      error: (err: any) => {
        console.error('Failed to load shelters', err);
        this.shelters = [];
        this.serviceError += 'Shelter service unavailable.';
      }
    });
  }

  initMap() {
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer || !this.showReportModal) {
      return;
    }

    // If map already exists, don't reinitialize
    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
      console.error('Leaflet library is not loaded');
      return;
    }

    this.map = L.map('map').setView([this.newReport.latitude || 20.5937, this.newReport.longitude || 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      this.newReport.latitude = e.latlng.lat;
      this.newReport.longitude = e.latlng.lng;
      L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map)
        .bindPopup('Report Location Selected')
        .openPopup();
    });
  }

  submitReport() {
    if (!this.newReport.location || !this.newReport.description || this.newReport.latitude === 0 || this.newReport.longitude === 0) {
      alert('Please fill in all fields and select a location.');
      return;
    }

    const reportData = {
      ...this.newReport,
      citizenId: this.authService.getUserId() || 0,
      date: new Date().toISOString(),
      status: 'ACTIVE'
    };

    console.log('Submitting report:', reportData);

    this.disasterService.createEmergency(reportData).subscribe({
      next: (res: any) => {
        alert('Report submitted successfully!');
        this.showReportModal = false;
        this.resetReportForm();
        this.loadData();
      },
      error: (err: any) => {
        console.error('Failed to submit report:', err);
        alert('Failed to submit report');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.setSelectedFile(file);
    }
  }

  onFileDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.setSelectedFile(files[0]);
    }
  }

  private setSelectedFile(file: File) {
    this.selectedFile = file;
    this.revokeFilePreviewUrl();
    this.filePreviewUrl = URL.createObjectURL(file);
  }

  private revokeFilePreviewUrl() {
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl);
      this.filePreviewUrl = null;
    }
  }

  submitVerification() {
    if (!this.verifyData.name || !this.selectedFile) {
      alert('Please provide a document name and select a file.');
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);
    formData.append('name', this.verifyData.name);
    formData.append('type', this.verifyData.type);
    formData.append('citizenId', this.newReport.citizenId.toString());

    this.documentService.uploadDocument(formData).subscribe({
      next: () => {
        alert('Document uploaded successfully!');
        this.showVerifyModal = false;
        this.resetVerifyForm();
        this.isUploading = false;
      },
      error: (err: any) => {
        const message = err?.error?.message || err?.message || 'Upload failed. Please try again.';
        alert(message);
        this.isUploading = false;
      }
    });
  }

  resetVerifyForm() {
    this.verifyData = { name: '', type: 'PDF Document' };
    this.selectedFile = null;
    this.revokeFilePreviewUrl();
  }

  closeVerifyModal() {
    this.showVerifyModal = false;
    this.resetVerifyForm();
  }
}
