import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../services/disaster.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterLink],
  templateUrl: './officer-dashboard.component.html',
  styleUrl: './officer-dashboard.component.css'
})
export class OfficerDashboardComponent implements OnInit {
  emergenciesCount = 0;
  sheltersCount = 0;
  recoveryProgramsCount = 0;
  inventoryCount = 0;
  citizensCount = 0;

  recentEmergencies: any[] = [];
  activePrograms: any[] = [];

  constructor(private disasterService: DisasterService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStats();
    }
  }

  loadStats() {
    this.disasterService.getEmergencies().subscribe(data => {
      this.recentEmergencies = data.slice(0, 5);
      this.emergenciesCount = data.length;
    });

    this.disasterService.getShelters().subscribe(data => {
      this.sheltersCount = data.length;
    });

    this.disasterService.getRecoveryPrograms().subscribe(data => {
      this.activePrograms = data.slice(0, 2);
      this.recoveryProgramsCount = data.length;
    });

    this.disasterService.getReliefItems().subscribe(data => {
      this.inventoryCount = data.length;
    });
  }
}
