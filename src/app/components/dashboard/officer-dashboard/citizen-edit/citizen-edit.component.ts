import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DisasterService } from '../../../../services/disaster.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-citizen-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './citizen-edit.component.html',
  styleUrls: ['./citizen-edit.component.css']
})
export class CitizenEditComponent implements OnInit {
  citizenId!: number;
  citizen: any = null; 
  saving = false;
  loading = true; // Prevents "null" errors in template

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private service: DisasterService
  ) {
    // Attempt to grab state from navigation
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state?.['citizen']) {
      this.citizen = { ...nav.extras.state['citizen'] }; // Clone to avoid mutation issues
      this.loading = false;
    }
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.citizenId = Number(idParam);

    if (!idParam || isNaN(this.citizenId)) {
      console.error('Invalid ID in URL');
      this.router.navigate(['/citizens']);
      return;
    }

    // Fetch if state is missing (on page refresh)
    if (!this.citizen) {
      this.service.getCitizenById(this.citizenId).subscribe({
        next: (data: any) => {
          this.citizen = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('API Error:', err);
          this.loading = false;
          this.router.navigate(['/citizens']);
        }
      });
    }
  }

  updateCitizen(): void {
    if (!this.citizen) return;
    this.saving = true;
    this.service.updateCitizenStatus(this.citizenId, this.citizen.status).subscribe({
      next: () => this.router.navigate(['/citizens']),
      error: (err: any) => {
        this.saving = false;
        alert('Update failed: ' + err.message);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/citizens']);
  }
}