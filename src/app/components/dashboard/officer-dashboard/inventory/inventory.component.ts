import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <--- Fixes the ngModel error
import { DisasterService } from '../../../../services/disaster.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, FormsModule],
  templateUrl: './inventory.component.html', // <--- Fixes the missing template error
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit { // <--- Fixes the app.routes.ts error
  inventoryItems: any[] = [];
  filteredItems: any[] = [];
  isLoading: boolean = true;

  // --- ENUM OPTIONS FOR RELIEF ITEMS ---
  statusOptions: string[] = ['AVAILABLE', 'LOW', 'OUTOFSTOCK', 'RESERVED'];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.disasterService.getReliefItems().subscribe({
      next: (data: any) => {
        const items = Array.isArray(data) ? data : (data?.content || data?.data || []);
        
        // Map data to include UI state tracking for inline edits
        this.inventoryItems = items.map((item: any) => ({
          ...item,
          isEditing: false,
          newStatus: item.status || 'AVAILABLE'
        }));
        
        this.filteredItems = [...this.inventoryItems];
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading inventory:", err);
        this.isLoading = false;
      }
    });
  }

  // --- INLINE EDITING METHODS ---
  startEdit(item: any) {
    item.isEditing = true;
    item.newStatus = item.status || 'AVAILABLE';
  }

  cancelEdit(item: any) {
    item.isEditing = false;
  }

  saveEdit(item: any) {
    const targetId = item.itemId || item.id;
    
    if (!targetId) {
      alert("Error: Cannot find item ID.");
      return;
    }

    // Clone the item to send back to Spring Boot, overwriting only the status
    const payload = {
      ...item,
      status: item.newStatus
    };

    this.disasterService.updateReliefItem(targetId, payload).subscribe({
      next: (res: any) => {
        item.status = item.newStatus;
        item.isEditing = false;
      },
      error: (err: any) => {
        console.error("Update failed:", err);
        if (err.status === 200 || err.status === 201) {
           item.status = item.newStatus;
           item.isEditing = false;
        } else {
           alert("Failed to update item status. Check console.");
        }
      }
    });
  }

  deleteItem(id: number) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this relief item?')) {
      this.disasterService.deleteReliefItem(id).subscribe({
        next: () => {
          this.loadData(); // Refresh the list
        },
        error: (err: any) => {
          console.error("Delete failed:", err);
          if (err.status === 200) {
            this.loadData();
          } else {
            alert("Failed to delete item.");
          }
        }
      });
    }
  }

  onSearch(event: any) {
    const term = (event.target.value || '').toLowerCase();
    this.filteredItems = this.inventoryItems.filter(item =>
      (item.name || item.itemName || '').toLowerCase().includes(term) ||
      (item.type || '').toLowerCase().includes(term) ||
      (item.program || '').toLowerCase().includes(term)
    );
  }
}