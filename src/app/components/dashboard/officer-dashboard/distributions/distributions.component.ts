import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { DisasterService } from '../../../../services/disaster.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-distributions',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, FormsModule],
  templateUrl: './distributions.component.html',
  styleUrls: ['./distributions.component.css']
})
export class DistributionsComponent implements OnInit, OnDestroy {
  distributions: any[] = [];
  filteredDistributions: any[] = [];
  reliefItems: any[] = []; 
  isLoading: boolean = true;
  private destroy$ = new Subject<void>();

  // --- ENUM OPTIONS FOR THE DROPDOWN ---
  statusOptions: string[] = ['PENDING', 'APPROVED', 'DISTRIBUTED', 'CANCELLED'];

  constructor(
    private disasterService: DisasterService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Fetching supporting data and main distributions simultaneously
    forkJoin({
      items: this.disasterService.getReliefItems().pipe(catchError(() => of([]))),
      distData: this.disasterService.getDistributions().pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.reliefItems = Array.isArray(res.items) ? res.items : (res.items?.content || []);
        this.processDistributions(res.distData);
      },
      error: () => this.isLoading = false
    });
  }

  processDistributions(data: any[]) {
    this.distributions = data.map(d => {
      const foundItem = this.reliefItems.find(i => String(i.itemId || i.id) === String(d.itemId));
      
      // Parsing the Notes field for Incident and Program strings
      let extractedIncident = '-';
      let extractedProgram = '-';
      if (d.notes) {
        const parts = d.notes.split('|');
        parts.forEach((part: string) => {
          if (part.includes('Incident:')) extractedIncident = part.replace('Incident:', '').trim();
          if (part.includes('Program:')) extractedProgram = part.replace('Program:', '').trim();
        });
      }

      return {
        ...d,
        displayItemName: foundItem ? (foundItem.itemName || foundItem.name) : `ID: ${d.itemId}`,
        parsedIncident: extractedIncident,
        parsedProgram: extractedProgram,
        isEditing: false, // UI state tracker for inline edit
        newStatus: d.status // Holds the dropdown selection
      };
    });
    this.filteredDistributions = [...this.distributions];
    this.isLoading = false;
  }

  getPillClass(status: string): string {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'DISTRIBUTED' || s === 'DELIVERED') return 'emerald';
    if (s === 'PENDING') return 'amber'; 
    if (s === 'CANCELLED') return 'rose';
    if (s === 'APPROVED') return 'teal'; 
    return 'slate';
  }

  // --- INLINE EDITING METHODS ---
  startEdit(d: any) {
    d.isEditing = true;
    d.newStatus = d.status || 'PENDING';
  }

  cancelEdit(d: any) {
    d.isEditing = false;
  }

  saveEdit(d: any) {
    const targetId = d.distributionId || d.id;
    if (!targetId) {
      alert("Error: Cannot find distribution ID.");
      return;
    }

    const payload = {
      distributionId: targetId,
      itemId: d.itemId,
      citizenId: d.citizenId || 1,
      officerId: d.officerId || 1,
      quantity: d.quantity,
      notes: d.notes,
      status: d.newStatus
    };

    this.disasterService.updateDistribution(targetId, payload).subscribe({
      next: (res: any) => {
        d.status = d.newStatus;
        d.isEditing = false;
      },
      error: (err: any) => {
        console.error("Update failed:", err);
        // Fallback catch if Spring Boot returns 200 OK as plain text
        if (err.status === 200 || err.status === 201) {
           d.status = d.newStatus;
           d.isEditing = false;
        } else {
           alert("Failed to update status. Check console.");
        }
      }
    });
  }

  deleteDistribution(id: number) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this distribution?')) {
      this.disasterService.deleteDistribution(id).subscribe({
        next: () => {
          this.loadData(); // Refresh table
        },
        error: (err: any) => {
          console.error('Delete failed:', err);
          
          // Fallback check for plain text 200 OK messages
          if (err.status === 200) {
             this.loadData();
          } else {
             alert('Failed to delete. Check if the microservice is running.');
          }
        }
      });
    }
  }

  onSearch(event: any) {
    const term = (event.target.value || '').toLowerCase();
    this.filteredDistributions = this.distributions.filter(d =>
      (d.displayItemName || '').toLowerCase().includes(term) || 
      (d.parsedIncident || '').toLowerCase().includes(term)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}