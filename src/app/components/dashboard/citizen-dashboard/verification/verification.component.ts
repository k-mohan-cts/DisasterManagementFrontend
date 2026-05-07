import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { DisasterService } from '../../../../services/disaster.service';

interface CitizenDocumentRequestDTO {
  citizenId: number;
  docType: 'IDPROOF';
  fileURI: string;
  verificationStatus: 'PENDING';
}

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit {
  citizenId: number = 0;
  fileURI: string = '';
  isUploading: boolean = false;
  uploadError: string = '';

  // Simplified steps: 'welcome' -> 'upload' -> 'success' (labeled 'pending' in HTML)
  currentStep: 'welcome' | 'upload' | 'success' = 'welcome';

  constructor(
    private authService: AuthService,
    private disasterService: DisasterService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      this.router.navigate(['/login']);
      return;
    }
    this.citizenId = user.id;
  }

  startVerification() {
    this.currentStep = 'upload';
  }

  submitToBackend() {
    if (!this.fileURI.trim()) {
      this.uploadError = 'Please enter a valid File URI';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';

    const documentRequest: CitizenDocumentRequestDTO = {
      citizenId: this.citizenId,
      docType: 'IDPROOF',
      fileURI: this.fileURI.trim(),
      verificationStatus: 'PENDING'
    };

    // Triggering the send function to the backend
    this.disasterService.uploadCitizenDocument(documentRequest).subscribe({
      next: (response: any) => {
        this.isUploading = false;
        this.currentStep = 'success'; // Show the "Stay Tuned" screen
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          this.completeVerification();
        }, 3000);
      },
      error: (err: any) => {
        this.isUploading = false;
        // Handle 503 or other backend errors
        if (err.status === 503) {
          this.uploadError = 'Service Unavailable: The server is currently unable to handle the request. Please try again later.';
        } else {
          this.uploadError = err?.error?.message || 'Failed to submit document. Please check your connection.';
        }
      }
    });
  }

  completeVerification() {
    this.router.navigate(['/citizen-dashboard']);
  }

  goBack() {
    if (this.currentStep === 'upload') {
      this.currentStep = 'welcome';
      this.uploadError = '';
    }
  }
}