import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-manager-resources-mgmt',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './resources-mgmt.component.html',
  styleUrls: ['./resources-mgmt.component.css', '../manager-shared.css']
})
export class ResourcesMgmtComponent implements OnInit {
  resources: any[] = [];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.disasterService.getResources().subscribe({
      next: (data) => {
        this.resources = data;
      }
    });
  }
}
