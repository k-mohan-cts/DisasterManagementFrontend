import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.error = null;

    this.disasterService.getEmergencies().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        console.log('Reports loaded from API:', data);
        this.reports = (data || []).map((r: any) => ({
          id: 'REP-' + (r.reportId || Math.floor(Math.random() * 10000)),
          type: r.type || 'UNKNOWN',
          location: r.location || 'Location not specified',
          date: r.reportDate ? new Date(r.reportDate).toLocaleDateString() : new Date().toLocaleDateString(),
          status: r.status || 'NEW',
          description: r.description || 'No description provided'
        }));
        console.log('Reports mapped:', this.reports);
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.error = 'Failed to load reports. Please try again later.';
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
