// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
// import { DisasterService } from '../../../../services/disaster.service';

// @Component({
//   selector: 'app-resources-mgmt',
//   standalone: true,
//   imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
//   templateUrl: './resources-mgmt.component.html',
//   styleUrls: ['./resources-mgmt.component.css']
// })
// export class ResourcesMgmtComponent implements OnInit {
//   showModal: boolean = false;
//   resources: any[] = [];
//   programs: any[] = []; // List to hold programs from the database
//   resourceForm!: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private disasterService: DisasterService
//   ) {}

//   ngOnInit(): void {
//     this.resourceForm = this.fb.group({
//       // We set default to null so the "Select" placeholder shows up
//       programId: [null, [Validators.required]],
//       name: ['', [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*$/)]],
//       type: ['', [Validators.required]],
//       quantity: [null, [Validators.required, Validators.min(1)]],
//       unit: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
//       unitPrice: [null, [Validators.required, Validators.min(0.01)]]
//     });

//     this.loadResources();
//     this.loadPrograms(); // Fetch programs when component loads
//   }

//   loadResources(): void {
//     this.disasterService.getResources().subscribe({
//       next: (data) => this.resources = data,
//       error: (err) => console.error("Error fetching resources", err)
//     });
//   }

//   loadPrograms(): void {
//     // This assumes your DisasterService has a getPrograms method
//     this.disasterService.getRecoveryPrograms().subscribe({
//       next: (data) => this.programs = data,
//       error: (err) => console.error("Error fetching programs", err)
//     });
//   }

//   openModal(): void { this.showModal = true; }

//   closeModal(): void {
//     this.showModal = false;
//     this.resourceForm.reset();
//   }

//   onSubmit(): void {
//     if (this.resourceForm.valid) {
//       const payload = this.resourceForm.value;
//       const managerId = 10; 

//       this.disasterService.addResource(payload, managerId).subscribe({
//         next: (res) => {
//           alert("Resource saved successfully!");
//           this.closeModal();
//           this.loadResources(); 
//         },
//         error: (err) => {
//           console.error("Backend Error:", err);
//           const serverMessage = err.error?.message || "Check backend logs";
//           alert("Database Error: " + serverMessage);
//         }
//       });
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-resources-mgmt',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
  templateUrl: './resources-mgmt.component.html',
  styleUrls: ['./resources-mgmt.component.css']
})
export class ResourcesMgmtComponent implements OnInit {
  showModal: boolean = false;
  resources: any[] = [];
  programs: any[] = []; // List to hold programs from the database
  resourceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private disasterService: DisasterService
  ) {}

  ngOnInit(): void {
    this.resourceForm = this.fb.group({
      // Set default to null so the "Select" placeholder shows up and is invalid initially
      programId: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*$/)]],
      type: ['', [Validators.required]],
      quantity: [null, [Validators.required, Validators.min(1)]],
      unit: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      unitPrice: [null, [Validators.required, Validators.min(0.01)]]
    });

    this.loadResources();
    this.loadPrograms(); // Fetch programs when component loads
  }

  loadResources(): void {
    this.disasterService.getResources().subscribe({
      next: (data) => this.resources = data,
      error: (err) => console.error("Error fetching resources", err)
    });
  }

  loadPrograms(): void {
    this.disasterService.getRecoveryPrograms().subscribe({
      next: (data) => {
        this.programs = data || [];
        console.log("Programs loaded:", this.programs); // Check console to verify properties
      },
      error: (err) => console.error("Error fetching programs", err)
    });
  }

  openModal(): void { this.showModal = true; }

  closeModal(): void {
    this.showModal = false;
    this.resourceForm.reset({ programId: null, type: '' });
  }

  onSubmit(): void {
    if (this.resourceForm.valid) {
      // Create a copy of the form values
      const formValues = this.resourceForm.value;
      
      // CRITICAL FIX: Ensure programId is sent as a strict integer to the backend
      const payload = {
        ...formValues,
        programId: Number(formValues.programId)
      };
      
      const managerId = 10; 

      this.disasterService.addResource(payload, managerId).subscribe({
        next: (res) => {
          alert("Resource saved successfully!");
          this.closeModal();
          this.loadResources(); 
        },
        error: (err) => {
          console.error("Backend Error:", err);
          const serverMessage = err.error?.message || "Check backend logs";
          alert("Database Error: " + serverMessage);
        }
      });
    }
  }
}