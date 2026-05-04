import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-manager-recovery-programs',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './recovery-programs.component.html',
  styleUrls: ['./recovery-programs.component.css', '../manager-shared.css']
})
export class RecoveryProgramsComponent implements OnInit {
  programs: any[] = [];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.disasterService.getRecoveryPrograms().subscribe({
      next: (data) => {
        this.programs = data;
      }
    });
  }
}
