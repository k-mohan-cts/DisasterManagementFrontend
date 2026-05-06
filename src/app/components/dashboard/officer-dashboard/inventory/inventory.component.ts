import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-officer-inventory',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit, OnDestroy {
  items: any[] = [];
  filteredItems: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;
  private sub: Subscription | null = null;

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.loadInventory();
    }
  }

  loadInventory() {
    this.isLoading = true;

    const fallbackTimer = setTimeout(() => {
      if (this.isLoading) {
        console.warn('Backend request timed out. Forcing UI to unlock.');
        this.isLoading = false;
      }
    }, 3000);

    this.sub = this.disasterService.getReliefItems().subscribe({
      next: (data: any[]) => {
        clearTimeout(fallbackTimer); 
        this.items = data || [];
        this.filteredItems = data || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        clearTimeout(fallbackTimer);
        console.error('Error loading items:', err);
        this.items = [];
        this.filteredItems = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    if (!this.searchTerm) {
      this.filteredItems = this.items;
    } else {
      this.filteredItems = this.items.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchTerm)) ||
        (item.type && item.type.toLowerCase().includes(this.searchTerm))
      );
    }
  }

  deleteItem(itemId: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.disasterService.deleteReliefItem(itemId).subscribe({
        next: () => {
          this.loadInventory(); 
        },
        error: (err: any) => {
          console.error('Error deleting item', err);
          alert('Failed to delete the item. Check console for details.');
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}