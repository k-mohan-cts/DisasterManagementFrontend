import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DashboardStateService } from '../dashboard-state.service';
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

  constructor(private stateService: DashboardStateService) {}

  ngOnInit(): void {
    this.emergencies$ = this.stateService.emergencies$;
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