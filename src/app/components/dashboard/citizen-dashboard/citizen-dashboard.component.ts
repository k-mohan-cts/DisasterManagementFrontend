import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DisasterService } from '../../../services/disaster.service';
import { AuthService } from '../../../services/auth.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
declare let L: any;

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './citizen-dashboard.component.html',
  styleUrls: ['./citizen-dashboard.component.css']
})
export class CitizenDashboardComponent implements OnInit, AfterViewInit {
  reports: any[] = [];
  shelters: any[] = [];
  showReportModal = false;
  map: any;
  mapMarker: any;

  newReport = {
    citizenId: 0,
    location: '',
    type: 'FIRE',
    status: 'ACTIVE',
    latitude: 0,
    longitude: 0,
    description: ''
  };

  emergencyTypes = ['FLOOD', 'FIRE', 'EARTHQUAKE', 'CYCLONE', 'LANDSLIDE', 'OTHER'];
  reportStatus = ['ACTIVE']; // Only ACTIVE by default

  constructor(
    private disasterService: DisasterService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.newReport.citizenId = this.authService.getUserId() || 0;
    this.loadData();

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

  openReportModal() {
    this.showReportModal = true;
    // Initialize map after modal is shown and DOM is updated
    this.cdr.detectChanges();
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  loadData() {
    this.disasterService.getEmergencies().subscribe({
      next: (data: any[]) => {
        this.reports = data.map((r: any) => ({
          type: r.type,
          date: new Date(r.reportDate).toLocaleDateString(),
          status: r.status
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Failed to load reports:', err)
    });

    this.disasterService.getShelters().subscribe({
      next: (data: any[]) => {
        console.log('Backend Response:', data);

        if (!data || data.length === 0) {
          console.warn('No shelter data received from backend');
          return;
        }

        this.shelters = data.map((s: any) => {
          const name = s.name || s.shelterName || 'Unknown Shelter';
          const capacity = s.capacity || 0;
          const occupancy = s.occupancy || 0;
          const percentage = capacity > 0 ? (occupancy / capacity) * 100 : 0;
          let statusColor = '#14b8a6';
          if (percentage > 85) statusColor = '#ef4444';
          else if (percentage > 60) statusColor = '#f59e0b';

          return {
            name,
            location: s.location || 'N/A',
            capacity,
            occupancy,
            color: statusColor
          };
        });

        console.log('Mapped Shelters:', this.shelters);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Failed to load shelters:', err)
    });
  }

  initMap() {
    // Check if Leaflet is loaded
    if (typeof (window as any).L === 'undefined') {
      console.error('Leaflet library is not loaded');
      return;
    }

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    // If map already exists, just update it
    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    try {
      const lat = this.newReport.latitude || 20.5937;
      const lng = this.newReport.longitude || 78.9629;
      
      // Initialize map
      this.map = (window as any).L.map('map', {
        center: [lat, lng],
        zoom: 5,
        layers: []
      });

      // Add tile layer
      (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Add initial marker if coordinates exist
      if (this.newReport.latitude && this.newReport.longitude) {
        this.mapMarker = (window as any).L.marker([this.newReport.latitude, this.newReport.longitude])
          .addTo(this.map)
          .bindPopup('Report Location')
          .openPopup();
      }

      // Click event to select location
      this.map.on('click', (e: any) => {
        this.newReport.latitude = e.latlng.lat;
        this.newReport.longitude = e.latlng.lng;

        if (this.mapMarker) {
          this.map.removeLayer(this.mapMarker);
        }

        this.mapMarker = (window as any).L.marker([e.latlng.lat, e.latlng.lng])
          .addTo(this.map)
          .bindPopup('Report Location Selected')
          .openPopup();
      });

      // Ensure map displays correctly
      this.map.invalidateSize(true);
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  submitReport() {
    if (!this.newReport.location || !this.newReport.description || this.newReport.latitude === 0 || this.newReport.longitude === 0) {
      alert('Please fill in all fields and select a location on the map.');
      return;
    }

    const report = {
      ...this.newReport,
      status: 'ACTIVE',
      date: new Date().toISOString(),
      citizenId: this.authService.getUserId() || 0
    };

    this.disasterService.createEmergency(report).subscribe({
      next: () => {
        alert('Report submitted successfully!');
        this.showReportModal = false;
        this.resetForm();
        this.loadData();
      },
      error: (err: any) => {
        console.error('Failed to submit report:', err);
        alert('Failed to submit report');
      }
    });
  }

  resetForm() {
    this.newReport = {
      citizenId: this.authService.getUserId() || 0,
      location: '',
      type: 'FIRE',
      status: 'ACTIVE',
      latitude: 0,
      longitude: 0,
      description: ''
    };
    if (this.mapMarker) {
      this.map.removeLayer(this.mapMarker);
      this.mapMarker = null;
    }
  }

  closeReportModal() {
    this.showReportModal = false;
    this.resetForm();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}