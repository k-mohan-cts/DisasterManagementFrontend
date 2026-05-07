import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-officer-shelters',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './shelters.component.html',
  styleUrls: ['./shelters.component.css']
})
export class SheltersComponent implements OnInit, OnDestroy {
  shelters: any[] = [];
  filteredShelters: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;
  private sub: Subscription | null = null;

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.loadShelters();
  }

  loadShelters() {
    this.isLoading = true;
    this.sub = this.disasterService.getShelters().subscribe({
      next: (data: any[]) => {
        this.shelters = data || [];
        this.filteredShelters = data || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading shelters:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    if (!this.searchTerm) {
      this.filteredShelters = this.shelters;
    } else {
      this.filteredShelters = this.shelters.filter(s =>
        (s.name && s.name.toLowerCase().includes(this.searchTerm)) ||
        (s.location && s.location.toLowerCase().includes(this.searchTerm))
      );
    }
  }

  deleteShelter(id: number) {
    if (confirm('Are you sure you want to delete this shelter?')) {
      this.disasterService.deleteShelter(id).subscribe({
        next: () => this.loadShelters(),
        error: (err: any) => alert('Failed to delete shelter.')
      });
    }
  }

  getPercent(occupancy: number, capacity: number): number {
    if (!capacity || capacity === 0) return 0;
    return Math.min(100, Math.max(0, (occupancy / capacity) * 100));
  }

  // Maps status to the new CSS classes (emerald, rose, amber, slate)
  getPillClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'open') return 'emerald';
    if (s === 'full') return 'rose';
    if (s === 'undermaintenance') return 'amber';
    return 'slate'; // Default for closed/unknown
  }

  // Maps progress bar to warn or danger
  getProgressTone(percent: number, status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'full' || percent >= 90) return 'danger';
    if (percent >= 75) return 'warn';
    return ''; // Default (Green)
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}