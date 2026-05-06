import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../services/disaster.service';
import { FormsModule } from '@angular/forms';
<<<<<<< HEAD
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
=======
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, SidebarComponent, FormsModule, RouterModule],
=======
  imports: [CommonModule, SidebarComponent, FormsModule],
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  templateUrl: './auditor-dashboard.component.html',
  styleUrl: './auditor-dashboard.component.css'
})
export class AuditorDashboardComponent implements OnInit {
<<<<<<< HEAD
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

  constructor(
    private disasterService: DisasterService,
    private authService: AuthService,
    private router: Router
  ) {}
=======
  complianceRate = 50;
  pendingReviews = 1;
  activeAudits = 0;
  highRiskEntities = 0;

  showAuditModal = false;
  showComplianceModal = false;

  newAudit = {
    officerId: null,
    scope: '',
    findings: '',
    status: 'SCHEDULED'
  };

  newCompliance = {
    entityId: null,
    type: 'SAFETY',
    officerId: null,
    result: 'COMPLIANT',
    notes: ''
  };

  constructor(private disasterService: DisasterService) {}
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2

  ngOnInit() {
    this.loadStats();
  }

<<<<<<< HEAD
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

    this.disasterService.getAudits().subscribe({
      next: (data: any) => {
        const audits = this.normalizeList(data);
        this.activeAudits = audits.filter((a: any) => {
          const status = (a?.status || '').toUpperCase();
          return status === 'SCHEDULED' || status === 'IN_PROGRESS' || status === 'OPEN';
        }).length;
=======
  loadStats() {
    this.disasterService.getAudits().subscribe({
      next: (data: any[]) => {
        this.activeAudits = data.length;
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
      },
      error: (err: any) => console.error('Error fetching audits', err)
    });

    this.disasterService.getComplianceRecords().subscribe({
<<<<<<< HEAD
      next: (data: any) => {
        const records = this.normalizeList(data);
        this.totalComplianceRecords = records.length;

        this.compliantCount = records.filter((r: any) => this.normalizeResult(r?.result) === 'COMPLIANT').length;
        this.nonCompliantCount = records.filter((r: any) => this.normalizeResult(r?.result) === 'NONCOMPLIANT').length;
        this.pendingCount = records.filter((r: any) => this.normalizeResult(r?.result) === 'PENDINGREVIEW').length;

        this.pendingReviews = this.pendingCount;
        this.complianceRate = this.totalComplianceRecords > 0
          ? Math.round((this.compliantCount / this.totalComplianceRecords) * 100)
          : 0;

        this.highRiskEntities = new Set(
          records
            .filter((r: any) => this.normalizeResult(r?.result) === 'NONCOMPLIANT')
            .map((r: any) => r?.entityId)
            .filter((id: any) => id !== null && id !== undefined)
        ).size;

        this.recentComplianceRecords = [...records]
          .sort((a: any, b: any) => {
            const da = new Date(a?.createdAt || a?.auditDate || 0).getTime();
            const db = new Date(b?.createdAt || b?.auditDate || 0).getTime();
            return db - da;
          })
          .slice(0, 5);

        this.loadingDashboard = false;
      },
      error: (err: any) => {
        console.error('Error fetching compliance records', err);
        this.loadingDashboard = false;
=======
      next: (data: any[]) => {
        if (data && data.length > 0) {
          const compliantCount = data.filter((r: any) => r.result === 'COMPLIANT').length;
          this.complianceRate = Math.round((compliantCount / data.length) * 100);
          this.pendingReviews = data.filter((r: any) => r.result === 'PENDING_REVIEW').length;
        }
      },
      error: (err: any) => console.error('Error fetching compliance records', err)
    });
  }

  submitAudit() {
    this.disasterService.createAudit(this.newAudit).subscribe({
      next: () => {
        alert('Audit initiated successfully!');
        this.showAuditModal = false;
        this.loadStats();
        this.newAudit = { officerId: null, scope: '', findings: '', status: 'SCHEDULED' };
      },
      error: (err: any) => {
        console.error('Failed to create audit', err);
        alert('Failed to initiate audit. Please check your inputs.');
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
      }
    });
  }

<<<<<<< HEAD
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
=======
  submitCompliance() {
    this.disasterService.createComplianceRecord(this.newCompliance).subscribe({
      next: () => {
        alert('Compliance record added successfully!');
        this.showComplianceModal = false;
        this.loadStats();
        this.newCompliance = { entityId: null, type: 'SAFETY', officerId: null, result: 'COMPLIANT', notes: '' };
      },
      error: (err: any) => {
        console.error('Failed to create compliance record', err);
        alert('Failed to add compliance record. Please check your inputs.');
      }
    });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }
}
