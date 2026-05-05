import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { FormsModule } from '@angular/forms';

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
  
  newAudit: any = {
    officerId: null,
    scope: '',
    findings: '',
    status: 'SCHEDULED'
  };

  constructor(private disasterService: DisasterService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadAudits();
  }

  loadAudits() {
    this.disasterService.getAudits().subscribe({
      next: (data: any) => {
        // Handle Spring Data Page object or direct array, similar to System Logs
        const auditData = Array.isArray(data) ? data : (data.content || data._embedded?.audits || []);
        
        this.audits = auditData.map((a: any) => ({
          id: 'AUD-' + (a.auditId || a.id || Math.random()).toString().padStart(4, '0'),
          officerId: a.officerId ? 'USR-' + a.officerId : 'N/A',
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
      },
      error: (err: any) => console.error('Error fetching audits', err)
    });
  }

  submitAudit() {
    this.disasterService.createAudit(this.newAudit).subscribe({
      next: () => {
        alert('Audit initiated successfully!');
        this.showModal = false;
        this.loadAudits();
        this.newAudit = { officerId: null, scope: '', findings: '', status: 'SCHEDULED' };
      },
      error: (err: any) => alert('Failed to initiate audit')
    });
  }
}
