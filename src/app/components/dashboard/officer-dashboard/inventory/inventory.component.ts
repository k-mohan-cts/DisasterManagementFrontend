import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-officer-inventory',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  items: any[] = [];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    // Endpoints for ReliefItems
    this.disasterService.getReliefItems().subscribe({
      next: (data) => {
        this.items = data;
      }
    });
  }
}
