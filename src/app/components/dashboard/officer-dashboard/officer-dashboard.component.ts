import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';

import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { DisasterService } from '../../../services/disaster.service';
import { DashboardStateService } from './dashboard-state.service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, DatePipe, DecimalPipe],
  templateUrl: './officer-dashboard.component.html',
  styleUrls: ['./officer-dashboard.component.css']
})
export class OfficerDashboardComponent implements OnInit {
  todayDate = new Date();

  // Summary Count Observables
  emergencyCounts$!: Observable<any[]>;
  shelterCounts$!: Observable<any[]>;
  programCounts$!: Observable<any[]>;
  inventoryCounts$!: Observable<any[]>;
  citizenCounts$!: Observable<any[]>;

  // ✅ New: Observables for the bottom list sections
  recentEmergencies$!: Observable<any[]>;
  activePrograms$!: Observable<any[]>;

  constructor(
    private dashboardState: DashboardStateService,
    private disasterService: DisasterService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Bind summary counts from state service
    this.emergencyCounts$ = this.dashboardState.emergencyCounts$;
    this.shelterCounts$   = this.dashboardState.shelterCounts$;
    this.programCounts$   = this.dashboardState.programCounts$;
    this.inventoryCounts$ = this.dashboardState.inventoryCounts$;
    this.citizenCounts$   = this.dashboardState.citizenCounts$;

    // Use normalized lists from DashboardStateService for recent sections
    this.recentEmergencies$ = this.dashboardState.emergencies$.pipe(
      map(list => (list || []).slice(0, 3))
    );

    this.activePrograms$ = this.dashboardState.programs$.pipe(
      map(list => (list || []).slice(0, 3))
    );

    this.dashboardState.loadAll();
  }

  getToneForStatus(label: string): string {
    const status = String(label).toUpperCase();
    const map: any = {
      ACTIVE: 'emerald', VALIDATED: 'emerald', OPEN: 'emerald', VERIFIED: 'emerald',
      PENDING: 'amber', LOW: 'amber',
      RESOLVED: 'violet', COMPLETED: 'violet', PLANNED: 'sky',
      FULL: 'rose', OUTOFSTOCK: 'rose',
      CLOSED: 'slate', INACTIVE: 'slate'
    };
    return map[status] || 'slate';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
