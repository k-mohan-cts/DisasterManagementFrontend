import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-manager-incidents',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.css', '../manager-shared.css']
})
export class IncidentsComponent implements OnInit {
  incidents: any[] = [];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.disasterService.getIncidents().subscribe({
      next: (data) => {
        this.incidents = data;
      }
    });
  }
}
