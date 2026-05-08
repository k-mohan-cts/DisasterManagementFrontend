import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DashboardStateService } from '../dashboard-state.service';
import { DisasterService } from '../../../../services/disaster.service';
// 1. Import the Sidebar Component
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-officer-emergencies',
  standalone: true,
  // 2. Add SidebarComponent and CommonModule to imports
  imports: [CommonModule, SidebarComponent], 
  templateUrl: './emergencies.component.html',
  styleUrls: ['./emergencies.component.css']
})
export class OfficerEmergenciesComponent implements OnInit {
  emergencies$!: Observable<any[]>;

  constructor(
    private stateService: DashboardStateService,
    private disasterService: DisasterService
  ) {}

  ngOnInit(): void {
    // Fetch directly from backend and normalize, so template fields are consistent
    this.emergencies$ = this.disasterService.getEmergencies().pipe(
      tap(list => console.log('Emergencies (backend):', list)),
      map(list => list.map(item => {
        const incidentType = item.incidentType || item.type || item.name || item.incident || 'Untitled Emergency';
        const rawDate = item.reportDate || item.date || item.createdAt || item.reportedAt || item.createdOn;
        let displayDate: Date | null = null;
        if (rawDate) {
          displayDate = typeof rawDate === 'number' ? new Date(rawDate) : new Date(String(rawDate));
        }
        return { ...item, incidentType, displayDate };
      }))
    );

    // keep other dashboard widgets in sync
    this.stateService.loadAll();
  }

  getTone(status: string): string {
    const s = String(status || '').toUpperCase();
    if (['ACTIVE', 'VALIDATED'].includes(s)) return 'emerald';
    if (s === 'PENDING') return 'amber';
    if (s === 'RESOLVED') return 'violet';
    return 'slate';
  }
}