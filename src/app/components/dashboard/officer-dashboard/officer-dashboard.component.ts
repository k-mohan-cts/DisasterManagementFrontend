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

    // ✅ Load raw list data for the "Recent" sections (Slicing to show top 2)
    this.recentEmergencies$ = this.disasterService.getEmergencies().pipe(
      map(list => list.slice(0, 2))
    );

    this.activePrograms$ = this.disasterService.getRecoveryPrograms().pipe(
      map(list => {
        // Debug log to inspect backend shape
        console.log('Recovery programs (dashboard):', list);
        return list
          .map(p => ({
            programName: p.programName || p.name || p.title,
            budget: p.budget || p.budgetAmount || p.amount || 0,
            status: p.status || p.state || 'Unknown',
            description: p.description || p.programDescription || ''
          }))
          .slice(0, 2);
      })
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
