import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-support-resources',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './support-resources.component.html',
  styleUrl: './support-resources.component.css'
})
export class SupportResourcesComponent {
  showHelplineModal = false;
  showStatusModal = false;

  helplines = [
    { title: 'Emergency Services', sub: 'Police, Fire, Ambulance', number: '112', class: 'bg-red-light' },
    { title: 'Disaster Relief', sub: 'National Management Authority', number: '1800-456-789', class: 'bg-blue-light' },
    { title: 'Medical Support', sub: '24/7 Citizen Health Desk', number: '104', class: 'bg-orange-light' }
  ];

  statuses = [
    { title: 'Food & Water Kit', badge: 'IN TRANSIT', badgeClass: 'badge-blue', info: 'Estimated Delivery: Today, 4:00 PM', location: 'Dispatch Center A' },
    { title: 'Emergency Blanket', badge: 'DELIVERED', badgeClass: 'badge-green', info: 'Received: Oct 20, 2023', location: 'Community Center' },
    { title: 'Medical Supplies', badge: 'PENDING', badgeClass: 'badge-yellow', info: 'In Queue for processing', location: 'Main Warehouse' }
  ];

  openModal(type: string) {
    if (type === 'helpline') this.showHelplineModal = true;
    else if (type === 'status') this.showStatusModal = true;
  }

  closeModals() {
    this.showHelplineModal = false;
    this.showStatusModal = false;
  }
}
