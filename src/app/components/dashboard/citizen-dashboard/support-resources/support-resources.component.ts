import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ReliefItem {
  itemId?: number;
  itemName: string;
  quantity: number;
  description?: string;
  category?: string;
  available?: number;
  // API response fields
  name?: string;
  type?: string;
  status?: string;
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RecoveryProgram {
  programId?: number;
  programName: string;
  description: string;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  // API response fields
  title?: string;
  budget?: number;
  managerId?: number;
  createdAt?: string;
}

interface Distribution {
  distributionId?: number;
  itemName: string;
  quantity: number;
  status: string;
  allocatedDate?: string;
  expectedDelivery?: string;
  location?: string;
  // API response fields
  citizenId?: number;
  itemId?: number;
  officeId?: number;
  date?: string;
  notes?: string;
}

@Component({
  selector: 'app-support-resources',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './support-resources.component.html',
  styleUrl: './support-resources.component.css'
})
export class SupportResourcesComponent implements OnInit, OnDestroy {
  showHelplineModal = false;
  showStatusModal = false;
  private destroy$ = new Subject<void>();

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

  reliefItems: ReliefItem[] = [];
  recoveryPrograms: RecoveryProgram[] = [];
  distributions: Distribution[] = [];

  loadingRelief = false;
  loadingPrograms = false;
  loadingDistribution = false;

  errorRelief: string | null = null;
  errorPrograms: string | null = null;
  errorDistribution: string | null = null;

  constructor(
    private disasterService: DisasterService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchReliefItems();
    this.fetchRecoveryPrograms();
    this.fetchDistributions();
  }

  openModal(type: string) {
    if (type === 'helpline') {
      this.showHelplineModal = true;
    } else if (type === 'status') {
      this.showStatusModal = true;
    }
  }

  closeModals() {
    this.showHelplineModal = false;
    this.showStatusModal = false;
  }

  fetchReliefItems() {
    this.loadingRelief = true;
    this.errorRelief = null;

    this.disasterService.getReliefItems().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        // Map API response to component interface
        this.reliefItems = (data || []).map((item: any) => ({
          itemId: item.itemId,
          itemName: item.itemName || item.name,
          quantity: item.quantity,
          description: item.description || item.type,
          category: item.category || item.type,
          available: item.available || item.quantity
        }));
        this.loadingRelief = false;
        this.cd.detectChanges();
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

    this.disasterService.getRecoveryPrograms().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        // Map API response to component interface
        this.recoveryPrograms = (data || []).map((program: any) => ({
          programId: program.programId,
          programName: program.programName || program.title,
          description: program.description,
          targetAudience: program.targetAudience,
          startDate: program.startDate,
          endDate: program.endDate,
          status: program.status
        }));
        this.loadingPrograms = false;
        this.cd.detectChanges();
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

    this.disasterService.getDistributions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        // Map API response to component interface
        this.distributions = (data || []).map((dist: any) => ({
          distributionId: dist.distributionId,
          itemName: dist.notes || `Item ${dist.itemId}`,
          quantity: dist.quantity,
          status: dist.status,
          allocatedDate: dist.date,
          expectedDelivery: dist.expectedDelivery,
          location: dist.location
        }));
        this.loadingDistribution = false;
        this.cd.detectChanges();
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
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }}
