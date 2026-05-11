import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './my-reports.component.html',
  styleUrl: './my-reports.component.css'
})
export class MyReportsComponent implements OnInit, OnDestroy {
  reports: any[] = []; 
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private disasterService: DisasterService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
  this.loading = true;
  this.error = null;

  // 1. Get the current Citizen ID from AuthService
  const citizenId = this.authService.getUserId(); 

  if (!citizenId) {
    this.error = 'User identity not found. Please log in again.';
    this.loading = false;
    return;
  }

  // 2. Call the NEW filtered function instead of getEmergencies()
  this.disasterService.getReportsByCitizenId(citizenId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        console.log('Filtered reports loaded for citizen ' + citizenId + ':', data);
        
        // 3. Mapping the data (Adapting to your DTO structure)
        this.reports = (data || []).map((r: any) => {
          // Note: Backend 'EmergencyReportDetailsResponseDTO' contains a 'report' object
          const reportData = r.report || r; 
          
          return {
            id: reportData.id ? 'REP-' + reportData.id : 'REP-' + Math.floor(Math.random() * 10000),
            type: reportData.type || 'UNKNOWN',
            location: reportData.location || 'Location not specified',
            // Use the date from the report object
            date: reportData.reportDate ? new Date(reportData.reportDate).toLocaleDateString() : new Date().toLocaleDateString(),
            status: reportData.status || 'NEW',
            description: reportData.description || 'No description provided',
            // Optional: You can now also use r.citizenName if you need it!
            reportedBy: r.citizenName || 'Me'
          };
        });

        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.error = 'Failed to load your reports. Please try again later.';
        this.loading = false;
        this.cd.markForCheck();
      }
    });
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('validated')) return 'status-validated';
    if (statusLower.includes('pending')) return 'status-pending';
    if (statusLower.includes('resolved')) return 'status-resolved';
    return 'status-new';
  }
}
