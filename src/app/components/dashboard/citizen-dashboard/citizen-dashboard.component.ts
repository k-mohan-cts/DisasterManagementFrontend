import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DisasterService } from '../../../services/disaster.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

declare let L: any;

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
  templateUrl: './citizen-dashboard.component.html',
  styleUrl: './citizen-dashboard.component.css'
})
export class CitizenDashboardComponent implements OnInit, AfterViewInit {
  reports: any[] = [];
  shelters: any[] = [];
  showReportModal = false;
  showVerifyModal = false;
  isUserVerified = false;
  serviceError = '';

  dashboardMap: any;
  reportMap: any;
  reportMarker: any;

  selectedFile: File | null = null;
  filePreviewUrl = '';

  verifyData = {
    name: '',
    type: 'Identity Card'
  };

  newReport = {
    citizenId: 0,
    location: '',
    type: 'FIRE',
    latitude: 0,
    longitude: 0,
    description: ''
  };

  emergencyTypes = ['FIRE', 'FLOOD', 'EARTHQUAKE', 'MEDICAL', 'OTHER'];
  documentTypes = ['Identity Card', 'Address Proof', 'Passport', 'Driving License', 'Utility Bill'];

  constructor(
    private disasterService: DisasterService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.newReport.citizenId = this.authService.getUserId() || 0;
    this.isUserVerified = this.authService.isVerified();
    this.loadData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.newReport.latitude = position.coords.latitude;
        this.newReport.longitude = position.coords.longitude;
        this.refreshReportMapCenter();
      });
    }
  }

  ngAfterViewInit() {
    this.initDashboardMap();
  }

  loadData() {
    this.serviceError = '';

    this.disasterService.getEmergencies().subscribe({
      next: (data: any[]) => {
        // Sort by date descending to get latest first, then take only 3
        const sortedReports = (data || []).sort((a, b) => {
          const dateA = new Date(a.reportDate).getTime();
          const dateB = new Date(b.reportDate).getTime();
          return dateB - dateA; // Latest first
        });

        this.reports = sortedReports.slice(0, 3).map((report: any) => ({
          type: report.type || 'UNKNOWN',
          date: report.reportDate ? new Date(report.reportDate).toLocaleDateString() : new Date().toLocaleDateString(),
          status: report.status || 'NEW'
        }));
      },
      error: () => {
        this.serviceError = 'Unable to load recent reports right now.';
      }
    });

    this.disasterService.getShelters().subscribe({
      next: (data: any[]) => {
        this.shelters = (data || []).map((shelter: any) => {
          const capacity = Number(shelter.capacity ?? 100) || 100;
          const occupancy = Number(shelter.occupancy ?? Math.floor(Math.random() * Math.max(capacity, 1))) || 0;
          return {
            name: shelter.name || shelter.shelterName || 'Unknown shelter',
            location: shelter.location || shelter.address || 'Location unavailable',
            occupancy,
            capacity,
            color: shelter.color || '#14b8a6'
          };
        });
      },
      error: () => {
        this.serviceError = 'Unable to load nearby shelters right now.';
      }
    });
  }

  openReportModal() {
    this.showReportModal = true;
    setTimeout(() => this.initReportMap(), 0);
  }

  closeReportModal() {
    this.showReportModal = false;
  }

  openVerifyModal() {
    this.showVerifyModal = true;
  }

  closeVerifyModal() {
    this.showVerifyModal = false;
    this.selectedFile = null;
    this.filePreviewUrl = '';
    this.verifyData = { name: '', type: this.documentTypes[0] };
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.setSelectedFile(file);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.setSelectedFile(file);
    }
  }

  submitVerification() {
    if (!this.selectedFile) {
      this.serviceError = 'Please select a document before uploading.';
      return;
    }

    const formData = new FormData();
    formData.append('citizenId', String(this.newReport.citizenId || this.authService.getUserId() || 0));
    formData.append('documentName', this.verifyData.name || this.selectedFile.name);
    formData.append('documentType', this.verifyData.type);
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.disasterService.uploadCitizenDocument(formData).subscribe({
      next: () => {
        alert('Verification document uploaded successfully!');
        this.isUserVerified = true;
        this.closeVerifyModal();
        this.loadData();
      },
      error: () => {
        this.serviceError = 'Failed to upload verification document.';
      }
    });
  }

  submitReport() {
    this.disasterService.createEmergency(this.newReport).subscribe({
      next: () => {
        alert('Report submitted successfully!');
        this.closeReportModal();
        this.loadData();
      },
      error: () => {
        this.serviceError = 'Failed to submit report.';
      }
    });
  }

  private setSelectedFile(file: File) {
    this.selectedFile = file;
    this.filePreviewUrl = URL.createObjectURL(file);

    if (!this.verifyData.name) {
      this.verifyData.name = file.name;
    }
  }

  private initDashboardMap() {
    const mapHost = document.getElementById('dashboardMap');
    if (!mapHost || this.dashboardMap) {
      return;
    }

    this.dashboardMap = L.map('dashboardMap').setView([
      this.newReport.latitude || 20.5937,
      this.newReport.longitude || 78.9629
    ], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.dashboardMap);
  }

  private initReportMap() {
    const mapHost = document.getElementById('reportMap');
    if (!mapHost) {
      return;
    }

    if (this.reportMap) {
      this.reportMap.remove();
    }

    this.reportMap = L.map('reportMap').setView([
      this.newReport.latitude || 20.5937,
      this.newReport.longitude || 78.9629
    ], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.reportMap);

    this.reportMap.on('click', (event: any) => {
      this.newReport.latitude = event.latlng.lat;
      this.newReport.longitude = event.latlng.lng;

      if (this.reportMarker) {
        this.reportMap.removeLayer(this.reportMarker);
      }

      this.reportMarker = L.marker([event.latlng.lat, event.latlng.lng]).addTo(this.reportMap)
        .bindPopup('Report location selected')
        .openPopup();
    });
  }

  private refreshReportMapCenter() {
    if (this.reportMap) {
      this.reportMap.setView([
        this.newReport.latitude || 20.5937,
        this.newReport.longitude || 78.9629
      ], this.reportMap.getZoom() || 5);
    }
  }
}
