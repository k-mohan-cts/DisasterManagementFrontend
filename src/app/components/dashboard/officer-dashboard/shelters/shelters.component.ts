import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-officer-shelters',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './shelters.component.html',
  styleUrl: './shelters.component.css'
})
export class SheltersComponent implements OnInit {
  shelters: any[] = [];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    this.disasterService.getShelters().subscribe({
      next: (data) => {
        this.shelters = data;
      }
    });
  }
}
