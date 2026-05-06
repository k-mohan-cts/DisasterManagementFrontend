import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../services/disaster.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './auditor-dashboard.component.html',
  styleUrl: './auditor-dashboard.component.css'
})
export class AuditorDashboardComponent implements OnInit {
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

  constructor(private disasterService: DisasterService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStats();
    }
  }

  loadStats() {
    this.disasterService.getAudits().subscribe({
      next: (data: any[]) => {
        this.activeAudits = data.length;
      },
      error: (err: any) => console.error('Error fetching audits', err)
    });

    this.disasterService.getComplianceRecords().subscribe({
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
      }
    });
  }

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
  }
}
