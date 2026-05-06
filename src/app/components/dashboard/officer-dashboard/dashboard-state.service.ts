import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DisasterService } from '../../../services/disaster.service';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {

  // ✅ counts
  emergencyCounts$ = new BehaviorSubject<any[]>([]);
  shelterCounts$   = new BehaviorSubject<any[]>([]);
  programCounts$   = new BehaviorSubject<any[]>([]);
  inventoryCounts$ = new BehaviorSubject<any[]>([]);
  citizenCounts$   = new BehaviorSubject<any[]>([]);
  citizens$ = new BehaviorSubject<any[]>([]);

  // ✅ FULL emergency list for dashboard
  emergencies$ = new BehaviorSubject<any[]>([]);

  constructor(private disasterService: DisasterService) {}

  loadAll(): void {
    forkJoin({
      emergencies: this.disasterService.getEmergencies()
        .pipe(catchError(() => of([]))),
      shelters: this.disasterService.getShelters()
        .pipe(catchError(() => of([]))),
      programs: this.disasterService.getRecoveryPrograms()
        .pipe(catchError(() => of([]))),
      inventory: this.disasterService.getReliefItems()
        .pipe(catchError(() => of([]))),
      citizens: this.disasterService.getAllCitizens().pipe(catchError(() => of([])))
    }).subscribe(({ emergencies, shelters, programs, inventory, citizens }) => {
      this.emergencies$.next(emergencies);   // ✅ expose list
      this.processEmergencies(emergencies);
      this.processShelters(shelters);
      this.processPrograms(programs);
      this.processInventory(inventory);
      this.processCitizens(citizens);

      this.citizens$.next(citizens);
    });
  }

  private processEmergencies(data: any[]): void {
    const status = (e: any) =>
      String(e.status || e.Status || '').toUpperCase();

    const active = ['ACTIVE', 'VALIDATED'];

    this.emergencyCounts$.next([
      { label: 'Active', count: data.filter(e => active.includes(status(e))).length },
      { label: 'Pending', count: data.filter(e => status(e) === 'PENDING').length },
      { label: 'Resolved', count: data.filter(e => status(e) === 'RESOLVED').length },
      { label: 'Closed', count: data.filter(e => status(e) === 'CLOSED').length }
    ]);
  }

  // other processors unchanged…


  private processShelters(data: any[]): void {
    const st = (s: any) => String(s.status || '').toUpperCase();
    this.shelterCounts$.next([
      { label: 'Open', count: data.filter(s => st(s) === 'OPEN').length },
      { label: 'Full', count: data.filter(s => st(s) === 'FULL').length },
      { label: 'Closed', count: data.filter(s => st(s) === 'CLOSED').length },
      { label: 'Maint', count: data.filter(s => st(s).includes('MAINT')).length }
    ]);
  }

  private processPrograms(data: any[]): void {
    const st = (p: any) => String(p.status || '').toUpperCase();
    this.programCounts$.next([
      { label: 'Active', count: data.filter(p => st(p) === 'ACTIVE').length },
      { label: 'Planned', count: data.filter(p => st(p) === 'PLANNED').length },
      { label: 'Completed', count: data.filter(p => st(p) === 'COMPLETED').length },
      { label: 'Suspended', count: data.filter(p => st(p) === 'SUSPENDED').length }
    ]);
  }

  private processInventory(data: any[]): void {
    const st = (i: any) => String(i.status || '').toUpperCase();
    this.inventoryCounts$.next([
      { label: 'Available', count: data.filter(i => st(i) === 'AVAILABLE').length },
      { label: 'Low', count: data.filter(i => st(i) === 'LOW').length },
      { label: 'OutOfStock', count: data.filter(i => st(i) === 'OUTOFSTOCK').length },
      { label: 'Reserved', count: data.filter(i => st(i) === 'RESERVED').length }
    ]);
  }

  private processCitizens(data: any[]): void {
    const st = (c: any) => String(c.status || '').toUpperCase();
    this.citizenCounts$.next([
      { label: 'Verified', count: data.filter(c => st(c) === 'VERIFIED').length },
      { label: 'Pending', count: data.filter(c => st(c) === 'PENDING').length },
      { label: 'Active', count: data.filter(c => st(c) === 'ACTIVE').length },
      { label: 'Inactive', count: data.filter(c => st(c) === 'INACTIVE').length }
    ]);
  }
}
