import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisasterService } from '../../../services/disaster.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
declare let L: any;

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './citizen-dashboard.component.html',
  styleUrl: './citizen-dashboard.component.css'
})
export class CitizenDashboardComponent implements OnInit, AfterViewInit {
  reports: any[] = [];
  shelters: any[] = [];
  showReportModal = false;
  map: any;
  
  newReport = {
    citizenId: 0,
    location: '',
    type: 'FIRE',
    latitude: 0,
    longitude: 0,
    description: ''
  };

  emergencyTypes = ['FIRE', 'FLOOD', 'EARTHQUAKE', 'MEDICAL', 'OTHER'];

  constructor(
    private disasterService: DisasterService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.newReport.citizenId = this.authService.getUserId() || 0;
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

  loadData() {
    this.disasterService.getEmergencies().subscribe({
      next: (data) => {
        this.reports = data.map(r => ({
          type: r.type,
          date: new Date(r.reportDate).toLocaleDateString(),
          status: r.status
        }));
      }
    });

    this.disasterService.getShelters().subscribe({
      next: (data) => {
        this.shelters = data.map(s => ({
          name: s.name,
          capacity: Math.floor(Math.random() * 100),
          color: '#14b8a6'
        }));
      }
    });
  }

  initMap() {
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
    this.disasterService.createEmergency(this.newReport).subscribe({
      next: (res) => {
        alert('Report submitted successfully!');
        this.showReportModal = false;
        this.loadData();
      },
      error: (err) => alert('Failed to submit report')
    });
  }
}
