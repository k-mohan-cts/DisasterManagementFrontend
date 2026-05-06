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

@Component({
  selector: 'app-support-resources',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './support-resources.component.html',
  styleUrl: './support-resources.component.css'
})
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