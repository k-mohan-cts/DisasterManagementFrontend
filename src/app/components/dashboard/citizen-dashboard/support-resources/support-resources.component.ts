<<<<<<< HEAD
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
=======
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

interface ReliefItem {
  itemId: number;
  itemName: string;
  quantity: number;
  description: string;
  category?: string;
  available?: number;
}

interface RecoveryProgram {
  programId: number;
  programName: string;
  description: string;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface Distribution {
  distributionId: number;
  itemName: string;
  quantity: number;
  status: string;
  allocatedDate?: string;
  expectedDelivery?: string;
  location?: string;
}
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2

@Component({
  selector: 'app-support-resources',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './support-resources.component.html',
  styleUrl: './support-resources.component.css'
})
<<<<<<< HEAD
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
=======
export class SupportResourcesComponent implements OnInit {
  reliefItems: ReliefItem[] = [];
  recoveryPrograms: RecoveryProgram[] = [];
  distributions: Distribution[] = [];

  loadingRelief = false;
  loadingPrograms = false;
  loadingDistribution = false;

  errorRelief: string | null = null;
  errorPrograms: string | null = null;
  errorDistribution: string | null = null;

  // Added cd to constructor
  constructor(
    private disasterService: DisasterService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.fetchReliefItems();
    this.fetchRecoveryPrograms();
    this.fetchDistributions();
  }

  fetchReliefItems() {
    this.loadingRelief = true;
    this.errorRelief = null;
    this.disasterService.getReliefItems().subscribe({
      next: (data) => {
        this.reliefItems = data || [];
        this.loadingRelief = false;
        this.cd.detectChanges(); // Tell Angular data changed
      },
      error: (err) => {
        console.error('Error fetching relief items:', err);
        this.errorRelief = 'Failed to load relief items';
        this.loadingRelief = false;
        this.cd.detectChanges();
      }
    });
  }

  fetchRecoveryPrograms() {
    this.loadingPrograms = true;
    this.errorPrograms = null;
    this.disasterService.getRecoveryPrograms().subscribe({
      next: (data) => {
        this.recoveryPrograms = data || [];
        this.loadingPrograms = false;
        this.cd.detectChanges(); // Tell Angular data changed
      },
      error: (err) => {
        console.error('Error fetching recovery programs:', err);
        this.errorPrograms = 'Failed to load recovery programs';
        this.loadingPrograms = false;
        this.cd.detectChanges();
      }
    });
  }

  fetchDistributions() {
    this.loadingDistribution = true;
    this.errorDistribution = null;
    this.disasterService.getDistributions().subscribe({
      next: (data) => {
        this.distributions = data || [];
        this.loadingDistribution = false;
        this.cd.detectChanges(); // Tell Angular data changed
      },
      error: (err) => {
        console.error('Error fetching distributions:', err);
        this.errorDistribution = 'Failed to load distribution status';
        this.loadingDistribution = false;
        this.cd.detectChanges();
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return 'badge-green';
    if (statusLower.includes('transit') || statusLower.includes('in transit')) return 'badge-blue';
    if (statusLower.includes('pending')) return 'badge-yellow';
    return 'badge-gray';
  }
}
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
