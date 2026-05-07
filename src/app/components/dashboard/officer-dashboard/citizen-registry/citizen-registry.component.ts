import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { DisasterService } from '../../../../services/disaster.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-citizen-registry',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent], 
  // FIX 1: Ensure this points to the REGISTRY html, not the edit html
  templateUrl: './citizen-registry.component.html', 
  styleUrls: ['./citizen-registry.component.css']
})
// FIX 2: Change the class name to CitizenRegistryComponent
export class CitizenRegistryComponent implements OnInit {
  citizens$!: Observable<any[]>;
  filteredCitizens$!: Observable<any[]>;
  searchTerm = '';

  constructor(private service: DisasterService, private router: Router) {}

  ngOnInit(): void {
    this.citizens$ = this.service.getAllCitizens();
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredCitizens$ = this.citizens$.pipe(
      map(citizens => {
        if (!this.searchTerm) return citizens;
        const term = this.searchTerm.toLowerCase();
        return citizens.filter(c => 
          c.name?.toLowerCase().includes(term) || c.status?.toLowerCase().includes(term)
        );
      })
    );
  }

  // citizen-registry.component.ts
editCitizen(citizen: any): void {
  const id = citizen.citizenId ?? citizen.id;
  if (!id) {
    alert('Citizen ID is missing.');
    return;
  }

  this.router.navigate(
    ['/officer/citizens/edit', id],
    { state: { citizen } }
  );
}
}