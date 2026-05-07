import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './system-logs.component.html',
  styleUrl: './system-logs.component.css'
})
export class SystemLogsComponent implements OnInit {
  logs: any[] = [];

  private _searchTerm = '';
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.currentPage = 1;
  }

  currentPage = 1;
  pageSize = 10;
  totalPagesServer = 0;
  Math = Math;

  constructor(
    private disasterService: DisasterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.disasterService.getAuditLogs(this.currentPage - 1, this.pageSize).subscribe({
      next: (data: any) => {
        const logData = Array.isArray(data) ? data : (data.content || data._embedded?.logs || []);
        this.totalPagesServer = data?.totalPages !== undefined ? data.totalPages : 1;

        this.logs = logData.map((log: any) => ({
          id: 'LOG-' + (log.logId || log.id || Math.random()).toString().padStart(5, '0'),
          user: typeof log.user === 'object' ? (log.user?.name || log.user?.username || 'System') : (log.user || 'System'),
          role: typeof log.user === 'object' ? (log.user?.role || 'Automated') : 'Automated',
          action: log.action || log.eventType || 'UNKNOWN',
          resource: log.resourceAffected || log.resource || 'System',
          timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date().toLocaleString(),
          ip: log.ipAddress || log.ip || '0.0.0.0',
          details: log.details || log.description || log.message || '-'
        }));

        setTimeout(() => {
          if (this.cdr && !(this.cdr as any).destroyed) {
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => console.error('Error fetching logs', err)
    });
  }

  get displayedLogs() {
    if (!this.searchTerm) {
      return this.logs;
    }

    return this.logs.filter((log: any) =>
      log.user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  nextPage() {
    if (this.currentPage < this.totalPagesServer) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPagesServer) {
      this.currentPage = page;
      this.loadLogs();
    }
  }
}
