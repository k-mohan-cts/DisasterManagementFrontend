import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../services/disaster.service';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './auditor-dashboard.component.html',
  styleUrl: './auditor-dashboard.component.css'
})
export class AuditorDashboardComponent implements OnInit {
  complianceRate = 50;
  pendingReviews = 1;
  activeAudits = 0;
  highRiskEntities = 0;

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.disasterService.getAudits().subscribe(data => {
      this.activeAudits = data.length;
    });
    // Add more logic to fetch real stats
  }
}
