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
    this.newAudit = {
      officerId: null,
      scope: '',
      findings: '',
      status: 'SCHEDULED'
    };
    this.showModal = true;
    this.populateOfficerIdFromEmail();
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
        // Handle Spring Data Page object or direct array, similar to System Logs
        const auditData = this.normalizeAuditResponse(data);
        
        this.audits = auditData.map((a: any) => ({
          id: 'AUD-' + (a.auditId || a.id || Math.random()).toString().padStart(4, '0'),
          officerId: a.officerId ? String(a.officerId) : 'N/A',
          scope: a.scope || '-',
          findings: a.findings || 'No findings documented',
          date: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          status: a.status || 'UNKNOWN'
        }));
        
        // Ensure rendering
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
        officerId: officerId || this.newAudit.officerId || null
      };

      this.disasterService.createAudit(payload).subscribe({
        next: () => {
          alert('Audit initiated successfully!');
          this.showModal = false;
          this.loadAudits();
          this.newAudit = { officerId: null, scope: '', findings: '', status: 'SCHEDULED' };
        },
        error: (err: any) => alert('Failed to initiate audit')
      });
    };

    if (this.newAudit.officerId) {
      submit(this.newAudit.officerId);
      return;
    }

    this.authService.getResolvedUserId().subscribe((officerId) => submit(officerId));
  }
}
