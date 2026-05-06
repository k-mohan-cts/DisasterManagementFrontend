import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DisasterService } from '../../../../services/disaster.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-distributions',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './distributions.component.html',
  styleUrls: ['./distributions.component.css']
})
export class DistributionsComponent implements OnInit {
  distributions: any[] = [];
  filteredDistributions: any[] = [];
  reliefItems: any[] = []; 
  isLoading: boolean = true;

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
    }).subscribe({
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
        parsedProgram: extractedProgram
      };
    });
    this.filteredDistributions = [...this.distributions];
    this.isLoading = false;
  }

  getPillClass(status: string): string {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'DISTRIBUTED' || s === 'DELIVERED') return 'emerald';
    if (s === 'PENDING') return 'amber'; // Amber matches your CSS yellow/orange
    if (s === 'CANCELLED') return 'rose';
    return 'slate';
  }

  editDistribution(distribution: any) {
    const id = distribution.distributionId || distribution.id;
    if (id) {
      this.router.navigate(['/create-distribution'], { queryParams: { id: id } });
    }
  }

  deleteDistribution(id: number) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this distribution?')) {
      this.disasterService.deleteDistribution(id).subscribe({
        next: () => {
          alert('Distribution deleted successfully.');
          this.loadData(); // Refresh table
        },
        error: (err: any) => {
          console.error('Delete failed:', err);
          alert('Failed to delete. Check if the microservice is running.');
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
}