import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  notifications = [
    { title: 'Document Pending Review', status: 'PENDING', badgeClass: 'badge-pending', bgClass: 'bg-pending', icon: 'fa-clock', iconClass: 'icon-yellow', desc: 'Your PDF document "Proof_of_Address.pdf" has been submitted and is currently awaiting verification.', date: 'Oct 16, 2023' },
    { title: 'Identity Verified', status: 'VERIFIED', badgeClass: 'badge-verified', bgClass: 'bg-verified', icon: 'fa-check-circle', iconClass: 'icon-green', desc: 'Your identity document "Identity_Card_Front.jpg" has been successfully verified.', date: 'Oct 15, 2023' },
    { title: 'New Alert: Medical Emergency', status: 'ACTION', badgeClass: 'badge-action', bgClass: 'bg-action', icon: 'fa-bell', iconClass: 'icon-blue', desc: 'A new emergency report has been validated in your district. Please check resources.', date: 'Oct 14, 2023' }
  ];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    // Fetch notifications from backend if available
  }
}
