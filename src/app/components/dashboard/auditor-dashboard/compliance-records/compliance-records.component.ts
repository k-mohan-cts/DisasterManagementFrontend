import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';
import { AuthService } from '../../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-compliance-records',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './compliance-records.component.html',
  styleUrl: './compliance-records.component.css'
})
export class ComplianceRecordsComponent implements OnInit {
  records: any[] = [];
  showModal = false;
  isBrowser = false;
  recordsError = '';
  
  recoveryPrograms: any[] = [];
  reliefItems: any[] = [];
  emergencyReports: any[] = [];
  filteredEntities: any[] = [];
  entitySearch: string = '';
  entityDropdownOpen = false;
  loadingDependencies = false;
  loadingRecords = false;
  dependencyError = '';
  
  newRecord: any = {
    entityId: null,
    type: 'PROGRAM', // PROGRAM, RELIEF, EMERGENCY
    officerId: null,
    result: 'PENDINGREVIEW', // COMPLIANT, NONCOMPLIANT, PENDINGREVIEW
    notes: ''
  };

  currentOfficerName = 'Auditor';

  constructor(
    private disasterService: DisasterService, 
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (!this.isBrowser) {
      return;
    }

    // Check if navigating from dashboard with openModal query param
    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'true') {
        setTimeout(() => {
          this.openCreateModal();
        }, 100);
      }
    });

    setTimeout(() => {
      this.loadRecords();
      this.loadDependencies();
    }, 0);
  }

  loadDependencies() {
    this.loadingDependencies = true;
    this.dependencyError = '';

    this.disasterService.getRecoveryPrograms().subscribe({
      next: (data: any) => {
        this.recoveryPrograms = Array.isArray(data) ? data : (data?.content || data?._embedded?.programs || []);
        this.filterEntities();
      },
      error: () => {
        this.recoveryPrograms = [];
      }
    });

    this.disasterService.getReliefItems().subscribe({
      next: (data: any) => {
        this.reliefItems = Array.isArray(data) ? data : (data?.content || data?._embedded?.reliefItems || []);
        this.filterEntities();
      },
      error: () => {
        this.reliefItems = [];
      }
    });

    this.disasterService.getEmergencies().subscribe({
      next: (data: any) => {
        this.emergencyReports = Array.isArray(data) ? data : (data?.content || data?._embedded?.reports || data?._embedded?.emergencies || []);
        this.filterEntities();
      },
      error: (err: any) => {
        this.emergencyReports = [];
        if (err?.status === 401) {
          this.dependencyError = 'Emergency reports require authentication.';
        }
      }
    });

    setTimeout(() => {
      this.loadingDependencies = false;
      if (!(this.cdr as any).destroyed) {
        this.cdr.detectChanges();
      }
    });
  }

  onTypeChange() {
    this.newRecord.entityId = null;
    this.entitySearch = '';
    this.entityDropdownOpen = false;
    this.filterEntities();
  }

  onEntitySearchInput() {
    this.entityDropdownOpen = true;
    this.newRecord.entityId = null;
    this.filterEntities();
  }

  openEntitySuggestions() {
    this.entityDropdownOpen = true;
    this.filterEntities();
  }

  selectEntity(entity: any) {
    this.newRecord.entityId = this.getEntityId(entity);
    this.entitySearch = this.getEntityDisplay(entity);
    this.entityDropdownOpen = false;
  }

  filterEntities() {
    let baseList: any[] = [];
    if (this.newRecord.type === 'PROGRAM') {
      baseList = this.recoveryPrograms;
    } else if (this.newRecord.type === 'RELIEF') {
      baseList = this.reliefItems;
    } else if (this.newRecord.type === 'EMERGENCY') {
      baseList = this.emergencyReports;
    }

    if (!this.entitySearch) {
      this.filteredEntities = baseList;
    } else {
      const search = this.entitySearch.toLowerCase();
      this.filteredEntities = baseList.filter(e => {
        const title = this.getEntityDisplay(e);
        return title.toLowerCase().includes(search);
      });
    }
  }

  getEntityDisplay(e: any): string {
    if (this.newRecord.type === 'PROGRAM') {
      return `${e.title || e.programName || 'Program'} (ID: ${e.programId || e.id})`;
    } else if (this.newRecord.type === 'RELIEF') {
      return `${e.itemName || 'Relief Item'} - ${e.category || ''} (ID: ${e.itemId || e.id})`;
    } else if (this.newRecord.type === 'EMERGENCY') {
      return `Report: ${e.description || e.type || 'Emergency'} (ID: ${e.reportId || e.id})`;
    }
    return '';
  }

  getEntityId(e: any): any {
    return e.programId || e.itemId || e.reportId || e.id;
  }

  openCreateModal() {
    this.showModal = true;
    this.newRecord = {
      entityId: null,
      type: 'PROGRAM',
      officerId: null,
      result: 'PENDINGREVIEW',
      notes: ''
    };
    this.entitySearch = '';
    this.entityDropdownOpen = false;
    this.filterEntities();
    this.populateOfficerIdFromEmail();
  }

  private populateOfficerIdFromEmail() {
    this.authService.getResolvedUserId().subscribe((officerId) => {
      this.newRecord.officerId = officerId;
    });
  }

  loadRecords() {
    this.loadingRecords = true;
    this.recordsError = '';
    this.disasterService.getComplianceRecords().subscribe({
      next: (data: any) => {
        const recordsData = this.normalizeRecordsResponse(data);
        
        this.records = recordsData.map((r: any) => ({
          id: 'COMP-' + (r.recordId || r.id || Math.random()).toString().padStart(4, '0'),
          entityId: r.entityId ? '#' + r.entityId : 'N/A',
          type: r.type || 'UNKNOWN',
          result: this.normalizeResult(r.result),
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          officerId: r.officerId ? 'USR-' + r.officerId : 'N/A',
          notes: r.notes || 'No notes provided'
        }));
        
        setTimeout(() => {
          if (this.cdr && !(this.cdr as any).destroyed) {
            this.cdr.detectChanges();
          }
        });

        this.loadingRecords = false;
      },
      error: (err: any) => {
        console.error('Error fetching compliance records', err);
        this.records = [];
        this.recordsError = err?.status === 401
          ? 'You are not authorized to view compliance records. Please sign in again.'
          : 'Unable to load compliance records right now.';
        this.loadingRecords = false;
      }
    });
  }

  private normalizeRecordsResponse(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }

    const embedded = data?._embedded;
    const candidates = [
      data?.content,
      data?.records,
      data?.items,
      data?.result,
      data?.data,
      embedded?.complianceRecords,
      embedded?.records,
      embedded?.items,
      embedded?.content
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }

    const arrayValue = Object.values(data || {}).find((value) => Array.isArray(value));
    return Array.isArray(arrayValue) ? arrayValue : [];
  }

  private normalizeResult(result: any): string {
    return (result || 'PENDINGREVIEW').toString().toUpperCase().replaceAll('_', '');
  }

  submitRecord() {
    if (!this.newRecord.entityId) {
      alert('Please select an entity first.');
      return;
    }

    const submit = (officerId: number | null) => {
      const payload = {
        ...this.newRecord,
        officerId: officerId || this.newRecord.officerId || null,
        entityId: parseInt(this.newRecord.entityId) || 0
      };

      this.disasterService.createComplianceRecord(payload).subscribe({
        next: () => {
          alert('Compliance record added successfully!');
          this.showModal = false;
          this.loadRecords();
        },
        error: (err: any) => alert('Failed to add record')
      });
    };

    if (this.newRecord.officerId) {
      submit(this.newRecord.officerId);
      return;
    }

    this.authService.getResolvedUserId().subscribe((officerId) => submit(officerId));
  }
}
