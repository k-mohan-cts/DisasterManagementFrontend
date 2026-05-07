// import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router'; // 1. Added Router imports
// import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
// import { DisasterService } from '../../../services/disaster.service';

// @Component({
//   selector: 'app-manager-dashboard',
//   standalone: true,
//   imports: [CommonModule, SidebarComponent, ReactiveFormsModule, RouterModule], // 2. Added RouterModule
//   templateUrl: './manager-dashboard.component.html',
//   styleUrls: ['./manager-dashboard.component.css']
// })
// export class ManagerDashboardComponent implements OnInit {
//   showModal: boolean = false;
//   resources: any[] = [];
//   resourceForm!: FormGroup;

//   constructor(
//     private fb: FormBuilder, 
//     private disasterService: DisasterService,
//     private router: Router, // 3. Injected Router
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     this.resourceForm = this.fb.group({
//       resourceName: ['', [Validators.required]],
//       type: ['', [Validators.required]],
//       quantity: ['', [Validators.required, Validators.min(1)]],
//       unit: ['', [Validators.required]],
//       unitPrice: ['', [Validators.required, Validators.min(0.01)]],
//       programId: ['', [Validators.required, Validators.min(1)]]
//     });
//   }

//   ngOnInit(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       this.loadResources();
//     }
//   }

//   // 4. Navigation methods using your exact paths
//   goToEmergencies() {
//     this.router.navigate(['/emergencies']);
//   }

//   goToPrograms() {
//     this.router.navigate(['/recovery-programs']);
//   }

//   loadResources(): void {
//     this.disasterService.getResources().subscribe({
//       next: (data: any[]) => { this.resources = data; },
//       error: (err: any) => { console.error("Failed to load inventory:", err); }
//     });
//   }

//   openModal(): void { this.showModal = true; }

//   closeModal(): void {
//     this.showModal = false;
//     this.resourceForm.reset();
//   }

//   onSubmit(): void {
//     if (this.resourceForm.valid) {
//       this.disasterService.addResource(this.resourceForm.value, 1).subscribe({
//         next: () => {
//           alert("Resource added successfully!");
//           this.closeModal();
//           this.loadResources();
//         },
//         error: (err: any) => { alert("Error saving resource."); }
//       });
//     }
//   }
// }
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../services/disaster.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule, RouterModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {
  showModal: boolean = false;
  resources: any[] = [];
  resourceForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private disasterService: DisasterService,
    private router: Router, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.resourceForm = this.fb.group({
      resourceName: ['', [Validators.required]],
      type: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', [Validators.required]],
      unitPrice: ['', [Validators.required, Validators.min(0.01)]],
      programId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadResources();
    }
  }

  // Navigation Methods
  goToEmergencies() {
    this.router.navigate(['/emergencies']);
  }

  goToPrograms() {
    this.router.navigate(['/recovery-programs']);
  }

  goToProgramsAndAdd() {
    // Navigates to recovery programs and passes a parameter to trigger the "New Program" action
    this.router.navigate(['/recovery-programs'], { queryParams: { action: 'new' } });
  }

  // Modal and Resource Methods
  loadResources(): void {
    this.disasterService.getResources().subscribe({
      next: (data: any[]) => { this.resources = data; },
      error: (err: any) => { console.error("Failed to load inventory:", err); }
    });
  }

  openModal(): void { this.showModal = true; }

  closeModal(): void {
    this.showModal = false;
    this.resourceForm.reset();
  }

  onSubmit(): void {
    if (this.resourceForm.valid) {
      this.disasterService.addResource(this.resourceForm.value, 1).subscribe({
        next: () => {
          alert("Resource added successfully!");
          this.closeModal();
          this.loadResources();
        },
        error: (err: any) => { alert("Error saving resource."); }
      });
    }
  }
}