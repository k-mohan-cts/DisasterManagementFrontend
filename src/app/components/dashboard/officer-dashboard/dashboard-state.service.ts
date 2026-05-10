import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DisasterService } from '../../../services/disaster.service';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  emergencyCounts$ = new BehaviorSubject<any[]>([]);
  shelterCounts$   = new BehaviorSubject<any[]>([]);
  programCounts$   = new BehaviorSubject<any[]>([]);
  inventoryCounts$ = new BehaviorSubject<any[]>([]);
  citizenCounts$   = new BehaviorSubject<any[]>([]);

  emergencies$ = new BehaviorSubject<any[]>([]);
  programs$    = new BehaviorSubject<any[]>([]);

  constructor(private disasterService: DisasterService) {}

  loadAll(): void {
    forkJoin({
      emergencies: this.disasterService.getEmergencies().pipe(catchError(() => of([]))),
      shelters: this.disasterService.getShelters().pipe(catchError(() => of([]))),
      programs: this.disasterService.getRecoveryPrograms().pipe(catchError(() => of([]))),
      inventory: this.disasterService.getReliefItems().pipe(catchError(() => of([]))),
      citizens: this.disasterService.getAllCitizens().pipe(catchError(() => of([])))
    }).subscribe(({ emergencies, shelters, programs, inventory, citizens }) => {
      // Normalize emergencies and programs for consistent UI fields
      const normalizedEmergencies = (emergencies || []).map((e: any) => ({
        id: e.id ?? e.reportId ?? e.report_id,
        incidentType: e.incidentType || e.type || e.name || e.incident || 'Unknown',
        location: e.location || e.address || e.place || '-',
        reportDate: e.reportDate || e.date || e.createdAt || e.timestamp,
        status: e.status || e.state || 'UNKNOWN',
        raw: e
      }));

      const normalizedPrograms = (programs || []).map((p: any) => ({
        id: p.id ?? p.programId,
        programName: p.programName || p.name || p.title || 'Untitled Program',
        budget: p.budget || p.budgetAmount || 0,
        status: p.status || p.state || 'UNKNOWN',
        raw: p
      }));

      // Update normalized lists
      this.emergencies$.next(normalizedEmergencies);
      this.programs$.next(normalizedPrograms);

      // Process counts
      this.processEmergencies(emergencies);
      this.processShelters(shelters);
      this.processPrograms(programs);
      this.processInventory(inventory);
      this.processCitizens(citizens);
    });
  }

  private processEmergencies(data: any[]) {
    // Helper to normalize status strings
    const st = (e: any) => String((e.status || e.state) || '').toUpperCase().trim();

    // Log backend data for debugging
    console.log('Emergency Data from Backend (normalized):', data);

    this.emergencyCounts$.next([
      {
        label: 'Pending',
        // Broaden matching to include common synonyms
        count: data.filter(e => {
          const s = st(e);
          return ['PENDING', 'OPEN', 'SUBMITTED', 'NEW'].includes(s) || /PEND|OPEN|SUBMIT/i.test(s);
        }).length
      },
      {
        label: 'Resolved',
        count: data.filter(e => {
          const s = st(e);
          return ['RESOLVED', 'COMPLETED', 'CLOSED'].includes(s) || /RESOLV|COMPLETE|CLOSE/i.test(s);
        }).length
      },
      {
        label: 'Total',
        count: data.length
      }
    ]);
  }

  // Ensure Inventory labels match your CSS and Logic
  private processInventory(data: any[]) {
    const st = (i: any) => String(i.status || '').toUpperCase().trim();
    this.inventoryCounts$.next([
      { label: 'Available', count: data.filter(i => st(i) === 'AVAILABLE').length },
      { label: 'Low', count: data.filter(i => st(i) === 'LOW').length },
      { label: 'Out of Stock', count: data.filter(i => st(i) === 'OUTOFSTOCK' || st(i) === 'OUT OF STOCK').length },
    ]);
  }

  private processShelters(data: any) {
    // Normalize possible backend shapes (array or envelope { data: [], content: [] })
    const list: any[] = Array.isArray(data) ? data : (data?.data || data?.content || []);

    const getStatus = (s: any) => String(s?.status || s?.state || s?.shelterStatus || (s?.isOpen === false ? 'CLOSED' : '') || '').toUpperCase();

    const isUnderMaint = (s: any) => {
      if (!s) { return false; }
      const st = getStatus(s);
      return st.includes('MAINT') || st.includes('MAINTENANCE') || st.includes('UNDER MAINTENANCE') || st.includes('UNDERMAINTENANCE');
    };

    const isClosed = (s: any) => {
      if (!s) { return false; }
      if (typeof s.isOpen === 'boolean') {
        return s.isOpen === false;
      }
      const st = getStatus(s);
      return st === 'CLOSED' || st.includes('CLOSED') || st.includes('SHUT') || st.includes('INACTIVE');
    };

    const isFull = (s: any) => {
      if (!s) { return false; }
      if (typeof s.occupancy === 'number' && typeof s.capacity === 'number') {
        return s.capacity > 0 && s.occupancy >= s.capacity;
      }
      if (typeof s.currentOccupancy === 'number' && typeof s.capacity === 'number') {
        return s.capacity > 0 && s.currentOccupancy >= s.capacity;
      }
      if (typeof s.availableBeds === 'number') {
        return s.availableBeds === 0;
      }
      const st = getStatus(s);
      return st === 'FULL' || st.includes('FULL') || st.includes('OCCUPIED') || /NO BEDS|0 BEDS|NO_BEDS/i.test(st);
    };

    const isOpen = (s: any) => {
      if (!s) { return false; }
      if (typeof s.isOpen === 'boolean') {
        return s.isOpen === true && !isClosed(s) && !isUnderMaint(s);
      }
      const st = getStatus(s);
      if (['OPEN', 'AVAILABLE', 'ACTIVE', 'VACANT'].includes(st)) { return true; }
      // If no explicit closed/maint/full marker, treat as open
      return !isClosed(s) && !isUnderMaint(s) && !isFull(s);
    };

    // Categorize with priority: UnderMaintenance -> Closed -> Full -> Open
    const counts = { OPEN: 0, FULL: 0, CLOSED: 0, UNDERMAINTENANCE: 0 };
    for (const s of list) {
      if (isUnderMaint(s)) { counts.UNDERMAINTENANCE++; continue; }
      if (isClosed(s)) { counts.CLOSED++; continue; }
      if (isFull(s)) { counts.FULL++; continue; }
      if (isOpen(s)) { counts.OPEN++; continue; }
      // default to OPEN if uncertain
      counts.OPEN++;
    }

    this.shelterCounts$.next([
      { label: 'OPEN', count: counts.OPEN },
      { label: 'FULL', count: counts.FULL },
      { label: 'CLOSED', count: counts.CLOSED },
      { label: 'MAINTENANCE', count: counts.UNDERMAINTENANCE }
    ]);
  }

  private processPrograms(data: any[]) {
    const st = (p: any) => String(p.status || p.state || '').toUpperCase();
    // Normalize program name if needed
    const normalized = (data || []).map(p => ({
      ...p,
      programName: p.programName || p.name || p.title || 'Untitled Program'
    }));
    this.programCounts$.next([
      { label: 'Planned', count: normalized.filter(p => st(p) === 'PLANNED').length },
      { label: 'Completed', count: normalized.filter(p => st(p) === 'COMPLETED').length },
      { label: 'Suspended', count: normalized.filter(p => st(p) === 'SUSPENDED').length }
    ]);
  }

  private processCitizens(data: any[]) {
    const st = (c: any) => String(c.status || '').toUpperCase();
    this.citizenCounts$.next([
      { label: 'Verified', count: data.filter(c => st(c) === 'VERIFIED').length },
      { label: 'Pending', count: data.filter(c => st(c) === 'PENDING').length },
      { label: 'Active', count: data.filter(c => st(c) === 'ACTIVE').length }
    ]);
  }
}