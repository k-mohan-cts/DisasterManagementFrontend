import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-audit-management',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './audit-management.component.html',
  styleUrl: './audit-management.component.css'
})
export class AuditManagementComponent implements OnInit {
  audits: any[] = [];
  showModal = false;
  isLoading = false;
  pageError = '';
  isEditMode = false;
  editingAuditId: number | null = null;

  newAudit: any = {
    officerId: null,
    scope: '',
    findings: '',
    status: 'SCHEDULED'
  };

  constructor(
    private disasterService: DisasterService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'true') {
        this.openCreateModal();
      }
    });

    this.loadAudits();
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingAuditId = null;
    this.newAudit = {
      officerId: null,
      scope: '',
      findings: '',
      status: 'SCHEDULED'
    };
    this.showModal = true;
    this.populateOfficerIdFromEmail();
  }

  openEditModal(audit: any) {
    const sourceAudit = audit?.raw || audit;
    const auditId = this.resolveAuditId(sourceAudit) ?? this.resolveAuditId(audit);

    if (!auditId) {
      alert('Unable to determine which audit to edit.');
      return;
    }

    this.showModal = true;
    this.isEditMode = true;
    this.editingAuditId = auditId;
    this.populateOfficerIdFromEmail();

    this.disasterService.getAuditById(auditId).subscribe({
      next: (data: any) => {
        const auditDetails = this.normalizeSingleAuditResponse(data) || sourceAudit;
        this.applyAuditToForm(auditDetails, auditId);
      },
      error: () => {
        this.applyAuditToForm(sourceAudit, auditId);
      }
    });
  }

  private resolveAuditId(audit: any): number | null {
    const candidate = audit?.auditId ?? audit?.auditID ?? audit?.id;
    const numericId = Number(candidate);
    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  }

  private normalizeSingleAuditResponse(data: any): any {
    if (!data) {
      return null;
    }

    if (Array.isArray(data)) {
      return data[0] || null;
    }

    const embedded = data?._embedded;
    const candidates = [
      data?.content,
      data?.audit,
      data?.item,
      data?.data,
      embedded?.audits,
      embedded?.items
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate[0] || null;
      }

      if (candidate && typeof candidate === 'object') {
        return candidate;
      }
    }

    return typeof data === 'object' ? data : null;
  }

  private applyAuditToForm(audit: any, auditId?: number | null) {
    this.editingAuditId = auditId ?? this.resolveAuditId(audit) ?? this.editingAuditId;
    this.newAudit = {
      officerId: audit?.officerId ?? this.newAudit.officerId ?? null,
      scope: audit?.scope || '',
      findings: audit?.findings || '',
      status: audit?.status || 'SCHEDULED'
    };
  }

  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.editingAuditId = null;
  }

  private populateOfficerIdFromEmail() {
    this.authService.getResolvedUserId().subscribe((officerId) => {
      this.newAudit.officerId = officerId;
    });
  }

  loadAudits() {
    this.isLoading = true;
    this.pageError = '';

    this.disasterService.getAudits().subscribe({
      next: (data: any) => {
        const auditData = this.normalizeAuditResponse(data);

        this.audits = auditData.map((audit: any) => ({
          auditId: this.resolveAuditId(audit),
          id: 'AUD-' + (audit.auditId || audit.auditID || audit.id || Math.random()).toString().padStart(4, '0'),
          officerId: audit.officerId ? String(audit.officerId) : 'N/A',
          scope: audit.scope || '-',
          findings: audit.findings || 'No findings documented',
          date: audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          status: audit.status || 'UNKNOWN'
          ,raw: audit
        }));

        setTimeout(() => {
          if (this.cdr && !(this.cdr as any).destroyed) {
            this.cdr.detectChanges();
          }
        });
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching audits', err);
        this.pageError = 'Unable to load audit sessions right now.';
        this.audits = [];
        this.isLoading = false;
      }
    });
  }

  private normalizeAuditResponse(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }

    const embedded = data?._embedded;
    const candidates = [
      data?.content,
      data?.audits,
      data?.items,
      data?.result,
      data?.data,
      embedded?.audits,
      embedded?.items,
      embedded?.content
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }

    const arrayValue = Object.values(data || {}).find((value) => Array.isArray(value));
    return Array.isArray(arrayValue) ? arrayValue : [];
  }

  submitAudit() {
    const submit = (officerId: number | null) => {
      const payload = {
        ...this.newAudit,
        officerId: officerId || this.newAudit.officerId || null,
        auditId: this.isEditMode ? this.editingAuditId : undefined
      };

      const request$ = this.isEditMode && this.editingAuditId
        ? this.disasterService.updateAudit(this.editingAuditId, payload)
        : this.disasterService.createAudit(payload);

      request$.subscribe({
        next: () => {
          alert(this.isEditMode ? 'Audit updated successfully!' : 'Audit initiated successfully!');
          this.closeModal();
          this.loadAudits();
          this.newAudit = { officerId: null, scope: '', findings: '', status: 'SCHEDULED' };
        },
        error: (error: any) => {
          console.error('Failed to save audit', error);
          alert(this.isEditMode ? 'Failed to update audit' : 'Failed to initiate audit');
        }
      });
    };

    if (this.newAudit.officerId) {
      submit(this.newAudit.officerId);
      return;
    }

    this.authService.getResolvedUserId().subscribe((officerId) => submit(officerId));
  }
}
