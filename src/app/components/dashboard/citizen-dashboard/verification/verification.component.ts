import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { DisasterService } from '../../../../services/disaster.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

interface CitizenDocumentRequestDTO {
  citizenId: number;
  docType: 'IDPROOF' | 'RESIDENCE';
  fileURI: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit {
  citizenId: number = 0;
  docType: 'IDPROOF' | 'RESIDENCE' = 'IDPROOF';
  fileURI: string = '';
  isUploading: boolean = false;
  uploadMessage: string = '';
  uploadError: string = '';
  uploadSuccess: boolean = false;

  docTypeOptions = [
    { label: 'ID Proof (Passport, Aadhar, Driver License)', value: 'IDPROOF' },
    { label: 'Residence Proof (Address Certificate, Utility Bill)', value: 'RESIDENCE' }
  ];

  currentStep: 'welcome' | 'upload-idproof' | 'upload-residence' | 'pending' = 'welcome';
  documentsUploaded: { IDPROOF?: boolean; RESIDENCE?: boolean } = {};

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
    this.currentStep = 'upload-idproof';
    this.docType = 'IDPROOF';
  }

  proceedToResidenceProof() {
    if (!this.fileURI.trim()) {
      this.uploadError = 'Please enter a file URI for ID Proof';
      return;
    }
    this.documentsUploaded['IDPROOF'] = true;
    this.currentStep = 'upload-residence';
    this.docType = 'RESIDENCE';
    this.fileURI = '';
    this.uploadError = '';
  }

  uploadDocument() {
    if (!this.fileURI.trim()) {
      this.uploadError = 'Please enter a valid File URI';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';
    this.uploadMessage = '';

    const documentRequest: CitizenDocumentRequestDTO = {
      citizenId: this.citizenId,
      docType: this.docType,
      fileURI: this.fileURI.trim(),
      verificationStatus: 'PENDING'
    };

    console.log('Uploading document:', documentRequest);

    this.disasterService.uploadCitizenDocument(documentRequest).subscribe({
      next: (response: any) => {
        console.log('Document uploaded successfully:', response);
        this.documentsUploaded[this.docType] = true;
        this.uploadSuccess = true;
        this.uploadMessage = `${this.docType} document uploaded successfully!`;
        this.fileURI = '';
        this.isUploading = false;

        // If both documents uploaded, move to pending status
        if (this.documentsUploaded['IDPROOF'] && this.documentsUploaded['RESIDENCE']) {
          setTimeout(() => {
            this.currentStep = 'pending';
          }, 1500);
        } else if (this.docType === 'IDPROOF') {
          setTimeout(() => {
            this.proceedToResidenceProof();
          }, 1500);
        }
      },
      error: (err: any) => {
        console.error('Error uploading document:', err);
        this.uploadError = err?.error?.message || 'Failed to upload document. Please try again.';
        this.isUploading = false;
      }
    });
  }

  completeVerification() {
    // Redirect to dashboard or another page after verification is complete
    this.router.navigate(['/citizen-dashboard']);
  }

  goBack() {
    if (this.currentStep === 'upload-residence') {
      this.currentStep = 'upload-idproof';
      this.docType = 'IDPROOF';
      this.fileURI = '';
      this.uploadError = '';
    } else if (this.currentStep !== 'welcome') {
      this.currentStep = 'welcome';
    }
  }
}
