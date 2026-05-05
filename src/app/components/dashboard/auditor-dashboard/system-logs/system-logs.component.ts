import { Component, OnInit } from '@angular/core';
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
  searchTerm: string = '';

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.disasterService.getAuditLogs().subscribe({
      next: (data: any) => {
        // Handle Spring Data Page object or direct array
        const logData = data.content || data;
        this.logs = logData.map((l: any) => ({
          id: 'LOG-' + l.logId.toString().padStart(5, '0'),
          user: l.user?.name || 'System',
          role: l.user?.role || 'Automated',
          action: l.action,
          resource: l.resourceAffected || 'System',
          timestamp: new Date(l.timestamp).toLocaleString(),
          ip: l.ipAddress || '0.0.0.0'
        }));
      },
      error: (err: any) => console.error('Error fetching logs', err)
    });
  }

  getFilteredLogs() {
    if (!this.searchTerm) return this.logs;
    return this.logs.filter((l: any) => 
      l.user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      l.resource.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
