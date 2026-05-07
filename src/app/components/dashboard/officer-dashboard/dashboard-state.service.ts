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
      // Update raw lists
      this.emergencies$.next(emergencies);
      this.programs$.next(programs);

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
    const st = (e: any) => String(e.status || '').toUpperCase().trim();

    // Log this to your console to see exactly what 'status' values are coming from backend
    console.log('Emergency Data from Backend:', data);

    this.emergencyCounts$.next([
      { 
        label: 'Pending', 
        // Checks for 'PENDING', 'OPEN', or 'SUBMITTED'
        count: data.filter(e => st(e) === 'PENDING' || st(e) === 'OPEN' || st(e) === 'SUBMITTED').length 
      },
      { 
        label: 'Resolved', 
        count: data.filter(e => st(e) === 'RESOLVED' || st(e) === 'COMPLETED').length 
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

  private processShelters(data: any[]) {
    const st = (s: any) => String(s.status || '').toUpperCase();
    this.shelterCounts$.next([
      { label: 'Full', count: data.filter(s => st(s) === 'FULL').length },
      { label: 'Closed', count: data.filter(s => st(s) === 'CLOSED').length },
      { label: 'Maint.', count: data.filter(s => st(s).includes('MAINT')).length }
    ]);
  }

  private processPrograms(data: any[]) {
    const st = (p: any) => String(p.status || '').toUpperCase();
    this.programCounts$.next([
      { label: 'Planned', count: data.filter(p => st(p) === 'PLANNED').length },
      { label: 'Completed', count: data.filter(p => st(p) === 'COMPLETED').length },
      { label: 'Suspended', count: data.filter(p => st(p) === 'SUSPENDED').length }
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