import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compliance-records',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './compliance-records.component.html',
  styleUrl: './compliance-records.component.css'
})
export class ComplianceRecordsComponent implements OnInit {
  records: any[] = [];
  showModal = false;
  
  newRecord: any = {
    entityId: null,
    type: 'SAFETY',
    officerId: null,
    result: 'COMPLIANT',
    notes: ''
  };

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.disasterService.getComplianceRecords().subscribe({
      next: (data: any[]) => {
        this.records = data.map((r: any) => ({
          id: 'COMP-' + r.recordId.toString().padStart(4, '0'),
          entityId: '#' + r.entityId,
          type: r.type,
          result: r.result,
          date: new Date(r.createdAt).toLocaleDateString(),
          officerId: 'USR-' + r.officerId,
          notes: r.notes
        }));
      },
      error: (err: any) => console.error('Error fetching compliance records', err)
    });
  }

  submitRecord() {
    this.disasterService.createComplianceRecord(this.newRecord).subscribe({
      next: () => {
        alert('Compliance record added successfully!');
        this.showModal = false;
        this.loadRecords();
        this.newRecord = { entityId: null, type: 'SAFETY', officerId: null, result: 'COMPLIANT', notes: '' };
      },
      error: (err: any) => alert('Failed to add record')
    });
  }
}
