import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';

import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { DashboardStateService } from './dashboard-state.service';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent, DatePipe, DecimalPipe],
  templateUrl: './officer-dashboard.component.html',
  styleUrls: ['./officer-dashboard.component.css']
})
export class OfficerDashboardComponent implements OnInit {
  // Summary Count Observables from State Service
  emergencyCounts$!: Observable<any>;
  shelterCounts$!: Observable<any>;
  programCounts$!: Observable<any>;
  inventoryCounts$!: Observable<any>;
  citizenCounts$!: Observable<any>;

  // Data Lists for the bottom section
  recentEmergencies$!: Observable<any[]>;
  activePrograms$!: Observable<any[]>;

  constructor(
    private stateService: DashboardStateService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Initialize Observables
    this.emergencyCounts$ = this.stateService.emergencyCounts$;
    this.shelterCounts$ = this.stateService.shelterCounts$;
    this.programCounts$ = this.stateService.programCounts$;
    this.inventoryCounts$ = this.stateService.inventoryCounts$;
    this.citizenCounts$ = this.stateService.citizenCounts$;

    // 2. Trigger the backend fetch from the service
    this.stateService.loadAll();

    // 3. Fetch raw Emergencies from the service's BehaviorSubject
    this.recentEmergencies$ = this.stateService.emergencies$.pipe(
      map(list => list.slice(0, 2)) // Show only top 2 from DB
    );

    // 4. Fetch Citizens or Programs list from DB
    this.activePrograms$ = this.stateService.citizens$.pipe(
      map(list => list.slice(0, 2)) 
    );
  }

  // Logic to return CSS classes based on status string
  getToneForStatus(label: string): string {
    const status = String(label || '').toUpperCase();
    const statusMap: any = {
      ACTIVE: 'emerald', VALIDATED: 'emerald', OPEN: 'emerald', VERIFIED: 'emerald',
      PENDING: 'amber', LOW: 'amber',
      RESOLVED: 'violet', COMPLETED: 'violet',
      FULL: 'rose', OUTOFSTOCK: 'rose',
      CLOSED: 'slate', INACTIVE: 'slate'
    };
    return statusMap[status] || 'slate';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}