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
  
  private _searchTerm: string = '';
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
        console.log('Raw API Response:', data); // Debug log
        
        // Handle Spring Data Page object or direct array
        const logData = Array.isArray(data) ? data : (data.content || data._embedded?.logs || []);
        if (data.totalPages !== undefined) {
          this.totalPagesServer = data.totalPages;
        } else {
          this.totalPagesServer = 1; // Fallback
        }
        
        this.logs = logData.map((l: any) => {
          // Extract user name safely
          const userName = typeof l.user === 'object' ? (l.user?.name || l.user?.username || 'System') : (l.user || 'System');
          const userRole = typeof l.user === 'object' ? (l.user?.role || 'Automated') : 'Automated';
          
          return {
            id: 'LOG-' + (l.logId || l.id || Math.random()).toString().padStart(5, '0'),
            user: userName,
            role: userRole,
            action: l.action || l.eventType || 'UNKNOWN',
            resource: l.resourceAffected || l.resource || 'System',
            timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString() : new Date().toLocaleString(),
            ip: l.ipAddress || l.ip || '0.0.0.0',
            details: l.details || l.description || l.message || '-'
          };
        });
        console.log('Mapped Logs:', this.logs); // Debug log
        
        // Use setTimeout to ensure change detection runs safely outside the current digest cycle
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
    if (!this.searchTerm) return this.logs;
    return this.logs.filter((l: any) => 
      l.user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      l.resource.toLowerCase().includes(this.searchTerm.toLowerCase())
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
