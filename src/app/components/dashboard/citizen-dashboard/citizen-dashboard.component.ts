import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DisasterService } from '../../../services/disaster.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


declare let L: any;

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterLink],
  templateUrl: './citizen-dashboard.component.html',
  styleUrl: './citizen-dashboard.component.css'
})
export class CitizenDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  reports: any[] = [];
  shelters: any[] = [];
  showReportModal = false;
  showVerifyModal = false;
  isUserVerified = false;
  serviceError = '';

  dashboardMap: any;
  reportMap: any;
  reportMarker: any;
  dashboardMapInitialized = false;
  reportMapInitialized = false;

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
    description: '',
    date: '',
    reportId: 0,
    status: 'PENDING'
  };

  emergencyTypes = ['FIRE', 'FLOOD', 'EARTHQUAKE', 'MEDICAL', 'OTHER'];
  documentTypes = ['Identity Card', 'Address Proof', 'Passport', 'Driving License', 'Utility Bill'];

  private destroy$ = new Subject<void>();

  constructor(
    private disasterService: DisasterService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.isUserVerified = this.authService.isVerified();
    this.loadCitizenId();
    this.loadData();
    this.loadCurrentLocation();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initDashboardMap();
    }
  }
 // Removed invalid 'const' declaration. Use this.authService.getUserId() directly where needed.

  loadData() {
    this.serviceError = '';
    this.disasterService.getReportsByCitizenId(this.authService.getUserId() ?? 0).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any[]) => {
        // Map the response data, handling the nested structure from EmergencyReportDetailsResponseDTO
        const mappedData = (data || []).map((item: any) => {
          // The backend returns { report: {...}, citizenName: "..." }
          // So we need to extract the report object
          const reportData = item.report || item;
          return {
            type: reportData.type || 'UNKNOWN',
            location: reportData.location || 'Location not specified',
            date: reportData.reportDate ? new Date(reportData.reportDate).toLocaleDateString() : new Date().toLocaleDateString(),
            status: reportData.status || 'NEW'
          };
        });

        // Sort by date descending to get latest first, then take only 3
        const sortedReports = (mappedData || []).sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Latest first
        });
        
        this.reports = sortedReports.slice(0, 3);
      },
      error: () => {
        this.serviceError = 'Unable to load recent reports right now.';
      }
    });

    this.disasterService.getShelters().pipe(takeUntil(this.destroy$)).subscribe({
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

  async openReportModal() {
    await this.loadCurrentLocation();
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

    this.disasterService.uploadCitizenDocument(formData).pipe(takeUntil(this.destroy$)).subscribe({
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
    const citizenId = this.newReport.citizenId || this.authService.getUserId() || this.getStoredCitizenId();

    if (!citizenId || citizenId <= 0) {
      this.serviceError = 'Citizen ID is missing. Please log in again or complete verification first.';
      return;
    }

    const payload = {
      citizenId,
      date: this.formatLocalDateTime(new Date()),
      description: this.newReport.description?.trim() || '',
      latitude: Number(this.newReport.latitude),
      location: this.newReport.location?.trim() || '',
      longitude: Number(this.newReport.longitude),
      reportId: this.newReport.reportId || 0,
      status: this.newReport.status || 'VALIDATED',
      type: this.newReport.type
    };

    this.disasterService.createEmergency(payload).pipe(takeUntil(this.destroy$)).subscribe({
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

  private sendReportWithCitizenId(citizenId: number) {
    if (!citizenId || citizenId <= 0) {
      this.serviceError = 'Citizen ID is invalid. Please log in again or complete verification first.';
      return;
    }

    const payload = {
      citizenId,
      date: this.formatLocalDateTime(new Date()),
      description: this.newReport.description?.trim() || '',
      latitude: Number(this.newReport.latitude),
      location: this.newReport.location?.trim() || '',
      longitude: Number(this.newReport.longitude),
      reportId: this.newReport.reportId || 0,
      status: this.newReport.status || 'VALIDATED',
      type: this.newReport.type
    };

    console.log('📤 Submitting report with citizenId:', citizenId, 'Payload:', payload);

    this.disasterService.createEmergency(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        alert('Report submitted successfully!');
        this.closeReportModal();
        this.loadData();
      },
      error: (err) => {
        console.error('❌ Error submitting report:', err);
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

  private loadCurrentLocation(): Promise<void> {
    return new Promise((resolve) => {
      if (!isPlatformBrowser(this.platformId) || !navigator.geolocation) {
        resolve();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.newReport.latitude = position.coords.latitude;
          this.newReport.longitude = position.coords.longitude;
          this.refreshReportMapCenter();
          resolve();
        },
        () => resolve(),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  private initDashboardMap() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Prevent duplicate initialization
    if (this.dashboardMapInitialized && this.dashboardMap) {
      return;
    }

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

    this.dashboardMapInitialized = true;
  }

  private initReportMap() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Prevent duplicate initialization
    if (this.reportMapInitialized && this.reportMap) {
      return;
    }

    const mapHost = document.getElementById('reportMap');
    if (!mapHost) {
      return;
    }

    if (this.reportMap) {
      this.reportMap.remove();
    }

    const latitude = this.newReport.latitude || 20.5937;
    const longitude = this.newReport.longitude || 78.9629;

    this.reportMap = L.map('reportMap').setView([
      latitude,
      longitude
    ], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.reportMap);

    this.updateReportLocation(latitude, longitude);

    this.reportMap.on('click', (event: any) => {
      this.updateReportLocation(event.latlng.lat, event.latlng.lng);
      this.reportMap.setView([event.latlng.lat, event.latlng.lng], 17);
    });

    this.reportMapInitialized = true;
  }

  private refreshReportMapCenter() {
    if (this.reportMap) {
      const latitude = this.newReport.latitude || 20.5937;
      const longitude = this.newReport.longitude || 78.9629;

      this.reportMap.setView([
        latitude,
        longitude
      ], this.reportMap.getZoom() || 17);

      this.updateReportLocation(latitude, longitude);
    }
  }

  private updateReportLocation(latitude: number, longitude: number) {
    this.newReport.latitude = latitude;
    this.newReport.longitude = longitude;

    if (this.reportMap) {
      if (this.reportMarker) {
        this.reportMap.removeLayer(this.reportMarker);
      }

      this.reportMarker = L.marker([latitude, longitude]).addTo(this.reportMap)
        .bindPopup('Current selected location')
        .openPopup();
    }
  }

  private formatLocalDateTime(date: Date): string {
    const pad = (value: number, size = 2) => String(value).padStart(size, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = pad(date.getMilliseconds(), 3);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  private loadCitizenId() {
    const resolvedCitizenId = this.newReport.citizenId || this.authService.getUserId() || this.getStoredCitizenId();
    if (resolvedCitizenId && resolvedCitizenId > 0) {
      this.newReport.citizenId = resolvedCitizenId;
      return;
    }

    this.authService.getResolvedUserId().pipe(takeUntil(this.destroy$)).subscribe({
      next: (resolvedId) => {
        if (resolvedId && resolvedId > 0) {
          this.newReport.citizenId = resolvedId;
        }
      }
    });
  }

  private getStoredCitizenId(): number | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const storedCitizenId = localStorage.getItem('citizenId');
    if (!storedCitizenId) {
      return null;
    }

    const parsedCitizenId = Number(storedCitizenId);
    return Number.isFinite(parsedCitizenId) && parsedCitizenId > 0 ? parsedCitizenId : null;
  }

  ngOnDestroy() {
    // Clean up map instances
    if (this.dashboardMap) {
      this.dashboardMap.off();
      this.dashboardMap.remove();
      this.dashboardMap = null;
    }

    if (this.reportMap) {
      this.reportMap.off();
      this.reportMap.remove();
      this.reportMap = null;
    }

    // Complete all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
}
