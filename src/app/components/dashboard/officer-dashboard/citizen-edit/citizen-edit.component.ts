// citizen-edit.component.ts
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
  citizen: any = { name: '', status: '' }; 
  saving = false;
  loading = true;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private service: DisasterService
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state?.['citizen']) {
      this.citizen = { ...nav.extras.state['citizen'] };
      this.loading = false;
    }
  }

  ngOnInit(): void {
    // Get ID from the URL path: /officer/citizens/edit/:citizenId
    const idParam = this.route.snapshot.paramMap.get('citizenId');
    this.citizenId = Number(idParam);

    if (!idParam || isNaN(this.citizenId)) {
      this.router.navigate(['/citizens']);
      return;
    }

    // If citizen wasn't passed via state, fetch it from API
    if (this.loading) {
      this.service.getCitizenById(this.citizenId).subscribe({
        next: (data) => {
          this.citizen = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Fetch Error:', err);
          alert('Could not load citizen details.');
          this.router.navigate(['/citizens']);
        }
      });
    }
  }

  updateCitizen(): void {
    if (!this.citizen.status) return;
    this.saving = true;
    
    this.service.updateCitizenStatus(this.citizenId, this.citizen.status).subscribe({
      next: () => {
        alert('Status updated successfully!');
        this.router.navigate(['/citizens']);
      },
      error: (err) => {
        this.saving = false;
        console.error('Update Error:', err);
        alert('Update failed: ' + (err.error?.message || 'Server error'));
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/citizens']);
  }
}