import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-officer-distributions',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './distributions.component.html',
  styleUrl: './distributions.component.css'
})
export class DistributionsComponent implements OnInit {
  distributions: any[] = [];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.disasterService.getDistributions().subscribe({
      next: (data) => {
        this.distributions = data;
      }
    });
  }
}
