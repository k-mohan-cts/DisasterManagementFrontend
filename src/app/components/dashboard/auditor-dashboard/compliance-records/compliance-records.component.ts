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
  isEditMode = false;
  editingRecordId: number | null = null;

  recoveryPrograms: any[] = [];
  reliefItems: any[] = [];
  emergencyReports: any[] = [];
  filteredEntities: any[] = [];
  entitySearch = '';
  entityDropdownOpen = false;
  loadingDependencies = false;
  loadingRecords = false;
  dependencyError = '';

  newRecord: any = {
    entityId: null,
    type: 'PROGRAM',
    officerId: null,
    result: 'PENDINGREVIEW',
    notes: ''
  };

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

    this.route.queryParams.subscribe(params => {
      if (params['openModal'] === 'true') {
        setTimeout(() => this.openCreateModal(), 100);
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

  private extractBackendRecordId(record: any): number | null {
    const candidate = record?.recordId
      ?? record?.complianceRecordId
      ?? record?.complianceRecordID
      ?? record?.complianceId
      ?? record?.complianceID
      ?? record?.recordID
      ?? record?.id;

    const numericId = Number(candidate);
    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
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
      this.filteredEntities = baseList.filter(entity => {
        const title = this.getEntityDisplay(entity);
        return title.toLowerCase().includes(search);
      });
    }
  }

  getEntityDisplay(entity: any): string {
    if (this.newRecord.type === 'PROGRAM') {
      return `${entity.title || entity.programName || 'Program'} (ID: ${entity.programId || entity.id})`;
    } else if (this.newRecord.type === 'RELIEF') {
      return `${entity.itemName || 'Relief Item'} - ${entity.category || ''} (ID: ${entity.itemId || entity.id})`;
    } else if (this.newRecord.type === 'EMERGENCY') {
      return `Report: ${entity.description || entity.type || 'Emergency'} (ID: ${entity.reportId || entity.id})`;
    }
    return '';
  }

  getEntityId(entity: any): any {
    return entity.programId || entity.itemId || entity.reportId || entity.id;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingRecordId = null;
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

  openEditModal(record: any) {
    const sourceRecord = record?.raw || record;
    const recordId = this.extractBackendRecordId(sourceRecord) ?? this.extractBackendRecordId(record);

    if (!recordId) {
      alert('Unable to determine which compliance record to edit.');
      return;
    }

    this.showModal = true;
    this.isEditMode = true;
    this.editingRecordId = recordId;
    this.populateOfficerIdFromEmail();

    this.disasterService.getComplianceRecordById(recordId).subscribe({
      next: (data: any) => {
        const recordDetails = this.normalizeSingleComplianceRecord(data) || sourceRecord;
        this.applyRecordToForm(recordDetails, recordId);
      },
      error: () => {
        this.applyRecordToForm(sourceRecord, recordId);
      }
    });
  }

  private resolveRecordId(record: any): number | null {
    return this.extractBackendRecordId(record);
  }

  private normalizeSingleComplianceRecord(data: any): any {
    if (!data) {
      return null;
    }

    if (Array.isArray(data)) {
      return data[0] || null;
    }

    const embedded = data?._embedded;
    const candidates = [
      data?.content,
      data?.record,
      data?.complianceRecord,
      data?.item,
      data?.data,
      embedded?.complianceRecords,
      embedded?.records,
      embedded?.items
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate[0] || null;
      }

      if (candidate && typeof candidate === 'object') {
        return candidate;
      }
    }

    return typeof data === 'object' ? data : null;
  }

  private buildEntitySearchLabel(record: any): string {
    if (record?.entityLabel) {
      return record.entityLabel;
    }

    if (record?.type === 'PROGRAM') {
      return `Program (ID: ${record?.entityId ?? 'N/A'})`;
    }

    if (record?.type === 'RELIEF') {
      return `Relief Item (ID: ${record?.entityId ?? 'N/A'})`;
    }

    if (record?.type === 'EMERGENCY') {
      return `Emergency Report (ID: ${record?.entityId ?? 'N/A'})`;
    }

    return `Entity (ID: ${record?.entityId ?? 'N/A'})`;
  }

  private applyRecordToForm(record: any, recordId?: number | null) {
    const entityId = record?.entityId ?? record?.entityID ?? record?.entity?.id ?? null;

    this.editingRecordId = recordId ?? this.resolveRecordId(record) ?? this.editingRecordId;
    this.newRecord = {
      entityId: entityId !== null && entityId !== undefined ? Number(entityId) || entityId : null,
      type: record?.type || 'PROGRAM',
      officerId: record?.officerId ?? this.newRecord.officerId ?? null,
      result: this.normalizeResult(record?.result),
      notes: record?.notes || ''
    };

    this.entitySearch = this.buildEntitySearchLabel(record);
    this.entityDropdownOpen = false;
    this.filterEntities();
  }

  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.editingRecordId = null;
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

        this.records = recordsData.map((record: any) => ({
          recordId: this.resolveRecordId(record),
          id: 'COMP-' + (record.recordId || record.complianceRecordId || record.id || Math.random()).toString().padStart(4, '0'),
          entityId: record.entityId ? '#' + record.entityId : 'N/A',
          type: record.type || 'UNKNOWN',
          result: this.normalizeResult(record.result),
          date: record.createdAt ? new Date(record.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          officerId: record.officerId ? 'USR-' + record.officerId : 'N/A',
          notes: record.notes || 'No notes provided',
          raw: record
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
        entityId: Number(this.newRecord.entityId) || 0,
        recordId: this.isEditMode ? this.editingRecordId : undefined,
        complianceRecordId: this.isEditMode ? this.editingRecordId : undefined
      };

      const request$ = this.isEditMode && this.editingRecordId
        ? this.disasterService.updateComplianceRecord(this.editingRecordId, payload)
        : this.disasterService.createComplianceRecord(payload);

      request$.subscribe({
        next: () => {
          alert(this.isEditMode ? 'Compliance record updated successfully!' : 'Compliance record added successfully!');
          this.closeModal();
          this.loadRecords();
        },
        error: (error: any) => {
          console.error('Failed to save compliance record', error);
          alert(this.isEditMode ? 'Failed to update record' : 'Failed to add record');
        }
      });
    };

    if (this.newRecord.officerId) {
      submit(this.newRecord.officerId);
      return;
    }

    this.authService.getResolvedUserId().subscribe((officerId) => submit(officerId));
  }
}
