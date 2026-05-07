import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../services/disaster.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule, RouterModule],
  templateUrl: './auditor-dashboard.component.html',
  styleUrl: './auditor-dashboard.component.css'
})
export class AuditorDashboardComponent implements OnInit, OnDestroy {
  complianceRate = 0;
  activeAudits = 0;
  pendingReviews = 0;
  highRiskEntities = 0;
  compliantCount = 0;
  nonCompliantCount = 0;
  pendingCount = 0;
  totalComplianceRecords = 0;
  recentComplianceRecords: any[] = [];
  loadingDashboard = false;
  private destroy$ = new Subject<void>();

  constructor(
    private disasterService: DisasterService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  navigateToCompliance() {
    this.router.navigate(['/compliance-records'], { queryParams: { openModal: 'true' } });
  }

  navigateToAuditManagement() {
    this.router.navigate(['/audit-management'], { queryParams: { openModal: 'true' } });
  }

  private normalizeList(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }

    return data?.content || data?._embedded?.records || data?._embedded?.complianceRecords || [];
  }

  private normalizeResult(result: string): string {
    return (result || '').toUpperCase().replaceAll('_', '');
  }

  loadStats() {
    this.loadingDashboard = true;

    this.disasterService.getAudits().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        const audits = this.normalizeList(data);
        this.activeAudits = audits.filter((audit: any) => {
          const status = (audit?.status || '').toUpperCase();
          return status === 'SCHEDULED' || status === 'IN_PROGRESS' || status === 'OPEN';
        }).length;
      },
      error: (err: any) => console.error('Error fetching audits', err)
    });

    this.disasterService.getComplianceRecords().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        const records = this.normalizeList(data);
        this.totalComplianceRecords = records.length;

        this.compliantCount = records.filter((record: any) => this.normalizeResult(record?.result) === 'COMPLIANT').length;
        this.nonCompliantCount = records.filter((record: any) => this.normalizeResult(record?.result) === 'NONCOMPLIANT').length;
        this.pendingCount = records.filter((record: any) => this.normalizeResult(record?.result) === 'PENDINGREVIEW').length;

        this.pendingReviews = this.pendingCount;
        this.complianceRate = this.totalComplianceRecords > 0
          ? Math.round((this.compliantCount / this.totalComplianceRecords) * 100)
          : 0;

        this.highRiskEntities = new Set(
          records
            .filter((record: any) => this.normalizeResult(record?.result) === 'NONCOMPLIANT')
            .map((record: any) => record?.entityId)
            .filter((id: any) => id !== null && id !== undefined)
        ).size;

        this.recentComplianceRecords = [...records]
          .sort((a: any, b: any) => {
            const first = new Date(a?.createdAt || a?.auditDate || 0).getTime();
            const second = new Date(b?.createdAt || b?.auditDate || 0).getTime();
            return second - first;
          })
          .slice(0, 5);

        this.loadingDashboard = false;
      },
      error: (err: any) => {
        console.error('Error fetching compliance records', err);
        this.loadingDashboard = false;
      }
    });
  }

  resultLabel(result: string): string {
    const normalized = this.normalizeResult(result);
    if (normalized === 'PENDINGREVIEW') return 'Pending Review';
    if (normalized === 'NONCOMPLIANT') return 'Non-Compliant';
    if (normalized === 'COMPLIANT') return 'Compliant';
    return result || 'Unknown';
  }

  resultBadgeClass(result: string): string {
    const normalized = this.normalizeResult(result);
    if (normalized === 'COMPLIANT') return 'bg-green-50 text-emerald-700 border border-emerald-200';
    if (normalized === 'NONCOMPLIANT') return 'bg-red-50 text-red-700 border border-red-200';
    return 'bg-orange-50 text-amber-600 border border-amber-200';
  }

  recordTitle(record: any): string {
    return record?.entityName || record?.title || `Entity #${record?.entityId ?? 'N/A'}`;
  }

  recordDate(record: any): string {
    const source = record?.createdAt || record?.auditDate;
    return source ? new Date(source).toLocaleDateString() : 'N/A';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
