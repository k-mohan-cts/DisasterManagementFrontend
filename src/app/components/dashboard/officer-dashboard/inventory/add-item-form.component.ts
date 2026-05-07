import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DisasterService } from '../../../../services/disaster.service';

@Component({
  selector: 'app-add-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-item-form.component.html',
  styleUrls: ['./add-item-form.component.css']
})
export class AddItemFormComponent implements OnInit {
  // Reference Data
  programs: any[] = [];
  selectedProgramId: string = '';

  // Form Fields
  itemName: string = '';
  type: string = 'Food';
  quantity: number = 0;
  unitCost: number = 0;
  unit: string = '';
  status: string = 'Available';

  // Budget Variables
  totalBudget: number = 0;
  allocatedBudget: number = 0;
  remainingBudget: number = 0;
  totalItemCost: number = 0;

  constructor(
    private disasterService: DisasterService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPrograms();
  }

  loadPrograms() {
    this.disasterService.getRecoveryPrograms().subscribe({
      next: (res: any) => {
        // Unpack the JSON safely from Spring Boot
        this.programs = Array.isArray(res) ? res : (res?.content || res?.data || []);
        console.log("Programs Loaded from Backend:", this.programs); // Look at this in F12 Console!
      },
      error: (err) => console.error("Failed to load programs:", err)
    });
  }

  // Triggered when the user clicks the dropdown
  onProgramChange() {
    // 1. Find the selected program in our array
    const program = this.programs.find(p => 
      String(p.programId || p.id || p.ProgramID) === String(this.selectedProgramId)
    );

    if (program) {
      // 2. Set the budgets based on what Spring Boot sent back
      // NOTE: If the budget stays at $0, check your F12 console to see exactly what 
      // your backend named these variables (e.g., it might be p.totalBudget instead of p.budget)
      this.totalBudget = program.budget || program.totalBudget || program.Budget || 0;
      this.allocatedBudget = program.allocatedAmount || program.spentBudget || program.Allocated || 0;
    } else {
      this.totalBudget = 0;
      this.allocatedBudget = 0;
    }
    
    // 3. Recalculate remaining math
    this.calculateCosts();
  }

  // Triggered when Quantity or Unit Cost changes
  calculateCosts() {
    this.totalItemCost = (this.quantity || 0) * (this.unitCost || 0);
    this.remainingBudget = this.totalBudget - this.allocatedBudget - this.totalItemCost;
  }

  onSubmit() {
    if (this.remainingBudget < 0) {
      alert("Error: Total Item Cost exceeds the remaining budget!");
      return;
    }

    const payload = {
      programId: Number(this.selectedProgramId),
      name: this.itemName,
      type: this.type,
      quantity: this.quantity,
      unitCost: this.unitCost,
      unit: this.unit,
      status: this.status
    };

    this.disasterService.createReliefItem(payload).subscribe({
      next: (res) => {
        alert("Item added successfully!");
        this.router.navigate(['/relief-inventory']);
      },
      error: (err) => {
        console.error('Error creating item', err);
        alert('Failed to save item to the database.');
      }
    });
  }
}