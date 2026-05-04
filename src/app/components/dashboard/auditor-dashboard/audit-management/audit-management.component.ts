import { Component, OnInit } from '@angular/core';
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

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.loadAudits();
  }

  loadAudits() {
    this.disasterService.getAudits().subscribe({
      next: (data: any[]) => {
        this.audits = data.map((a: any) => ({
          id: 'AUD-' + a.auditId.toString().padStart(4, '0'),
          officerId: 'USR-' + a.officerId,
          scope: a.scope,
          findings: a.findings || 'No findings documented',
          date: new Date(a.createdAt).toLocaleDateString(),
          status: a.status
        }));
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
