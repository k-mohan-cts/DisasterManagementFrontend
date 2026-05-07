// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
// import { DisasterService } from '../../../../services/disaster.service';

// @Component({
//   selector: 'app-manager-recovery-programs',
//   standalone: true,
//   imports: [CommonModule, SidebarComponent, ReactiveFormsModule],
//   templateUrl: './recovery-programs.component.html',
//   styleUrls: ['./recovery-programs.component.css', '../manager-shared.css']
// })
// export class RecoveryProgramsComponent implements OnInit {
//   programs: any[] = [];
//   showModal: boolean = false;
//   programForm: FormGroup;

//   constructor(
//     private disasterService: DisasterService,
//     private fb: FormBuilder
//   ) {
//     // Validation logic matching RecoveryProgramRequestDTO
//     this.programForm = this.fb.group({
//       title: ['', [
//         Validators.required,
//         Validators.minLength(3),
//         Validators.maxLength(100),
//         Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*$/)
//       ]],
//       description: ['', [
//         Validators.required,
//         Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s\.,]*$/)
//       ]],
//       startDate: ['', Validators.required],
//       endDate: ['', Validators.required],
//       budget: ['', [Validators.required, Validators.min(0.01)]]
//     });
//   }

//   ngOnInit() {
//     this.loadPrograms();
//   }

//   loadPrograms() {
//     this.disasterService.getRecoveryPrograms().subscribe({
//       next: (data: any[]) => {
//         this.programs = data;
//       },
//       error: (err: any) => console.error('Failed to load programs', err)
//     });
//   }

//   openModal() {
//     this.showModal = true;
//   }

//   closeModal() {
//     this.showModal = false;
//     this.programForm.reset();
//   }

//   onSubmit() {
//     if (this.programForm.valid) {
//       this.disasterService.createRecoveryProgram(this.programForm.value).subscribe({
//         next: (response: any) => {
//           this.closeModal();
//           this.loadPrograms(); // Updates the "Active Programs" list
//           alert('Recovery Program Created successfully!');
//         },
//         error: (error: any) => {
//           console.error('Database save failed', error);
//           alert('Could not save program. Please check backend logs.');
//         }
//       });
//     } else {
//       this.programForm.markAllAsTouched();
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms'; // Added FormsModule here
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-manager-recovery-programs',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule, FormsModule], // Added FormsModule here
  templateUrl: './recovery-programs.component.html',
  styleUrls: ['./recovery-programs.component.css', '../manager-shared.css']
})
export class RecoveryProgramsComponent implements OnInit {
  programs: any[] = [];
  showModal: boolean = false;
  programForm: FormGroup;

  // --- NEW: Variables for Status Update Modal ---
  showStatusModal: boolean = false;
  selectedProgramId: number | null = null;
  newStatus: string = '';

  constructor(
    private disasterService: DisasterService,
    private fb: FormBuilder
  ) {
    this.programForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*$/)
      ]],
      description: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s\.,]*$/)
      ]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    this.loadPrograms();
  }

  loadPrograms() {
    this.disasterService.getRecoveryPrograms().subscribe({
      next: (data: any[]) => {
        this.programs = data;
      },
      error: (err: any) => console.error('Failed to load programs', err)
    });
  }

  // --- Create Program Logic ---
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.programForm.reset();
  }

  onSubmit() {
    if (this.programForm.valid) {
      this.disasterService.createRecoveryProgram(this.programForm.value).subscribe({
        next: (response: any) => {
          this.closeModal();
          this.loadPrograms(); 
          alert('Recovery Program Created successfully!');
        },
        error: (error: any) => {
          console.error('Database save failed', error);
          alert('Could not save program. Please check backend logs.');
        }
      });
    } else {
      this.programForm.markAllAsTouched();
    }
  }

  // --- NEW: Status Update Logic ---
  openStatusModal(program: any) {
    this.selectedProgramId = program.programId; 
    this.newStatus = program.status || 'PLANNED';
    this.showStatusModal = true;
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedProgramId = null;
  }

  submitStatusUpdate() {
    if (this.selectedProgramId && this.newStatus) {
      // Calls the service method to PATCH the update to your backend
      this.disasterService.updateProgramStatus(this.selectedProgramId, this.newStatus).subscribe({
        next: () => {
          this.closeStatusModal();
          this.loadPrograms(); // Refresh the table automatically
          alert('Status updated successfully!');
        },
        error: (err: any) => {
          console.error('Failed to update status', err);
          alert('Could not update status. Check backend logs.');
        }
      });
    }
  }
}