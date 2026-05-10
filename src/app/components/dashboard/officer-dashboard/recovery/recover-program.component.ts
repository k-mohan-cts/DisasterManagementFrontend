import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { DashboardStateService } from '../dashboard-state.service';
import { SidebarComponent } from '../../.././shared/sidebar/sidebar.component';

@Component({
  selector: 'app-officer-recovery-programs',
  standalone: true,
  imports: [CommonModule, SidebarComponent, DecimalPipe],
  templateUrl: './recover-program.component.html',
  styleUrls: ['./recover-program.component.css'] // Reusing styles
})
export class OfficerRecoveryProgramsComponent implements OnInit {
  programs$!: Observable<any[]>;

  constructor(private stateService: DashboardStateService) {}

  ngOnInit(): void {
    this.programs$ = this.stateService.programs$;
    this.stateService.loadAll();
  }

  getTone(status: string): string {
    const s = String(status || '').toUpperCase();
    if (s === 'OPEN') return 'emerald';
    if (s === 'CLOSED') return 'slate';
    return 'amber';
  }
}