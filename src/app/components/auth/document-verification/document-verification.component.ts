import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DisasterService } from '../../../services/disaster.service';

interface CitizenDocumentRequestDTO {
  citizenId: number;
  docType: 'IDPROOF' | 'RESIDENCE';
  fileURI: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

@Component({
  selector: 'app-document-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-verification.component.html',
  styleUrl: './document-verification.component.css'
})
export class DocumentVerificationComponent implements OnInit {
  citizenId: number = 0;
  docType: 'IDPROOF' | 'RESIDENCE' = 'IDPROOF';
  fileURI: string = '';
  selectedFile: File | null = null;
  isUploading: boolean = false;
  uploadMessage: string = '';
  uploadError: string = '';
  uploadSuccess: boolean = false;

  docTypeOptions = [
    { label: 'ID Proof (Passport, Aadhar, Driver License)', value: 'IDPROOF' },
    { label: 'Residence Proof (Address Certificate, Utility Bill)', value: 'RESIDENCE' }
  ];

  currentStep: 'welcome' | 'upload-idproof' | 'upload-residence' | 'pending' | 'success' = 'welcome';
  documentsUploaded: { IDPROOF?: boolean; RESIDENCE?: boolean } = {};

  constructor(
    private authService: AuthService,
    private disasterService: DisasterService,
    private router: Router
  ) {}

  ngOnInit() {
    // Try multiple ways to get citizenId
    let userId: number | null = null;

    // Method 1: Try from AuthService
    const user = this.authService.getCurrentUser();
    if (user && (user.id || user.citizenId)) {
      userId = user.id || user.citizenId;
    }

    // Method 2: Try from localStorage
    if (!userId) {
      const storedCitizenId = localStorage.getItem('citizenId');
      if (storedCitizenId) {
        userId = parseInt(storedCitizenId, 10);
      }
    }

    // Method 3: Try to get from token payload
    if (!userId) {
      const token = this.authService.getToken();
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          userId = decoded.id || decoded.citizenId || decoded.userId;
        } catch (e) {
          console.warn('Could not decode token');
        }
      }
    }

    // Set citizenId
    this.citizenId = userId || 0;
    console.log('Document Verification - CitizenId:', this.citizenId);

    this.currentStep = 'upload-idproof';
    this.docType = 'IDPROOF';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Auto-generate fileURI from file name
      this.fileURI = `/documents/${this.selectedFile.name}`;
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      // Auto-generate fileURI from file name
      this.fileURI = `/documents/${this.selectedFile.name}`;
    }
  }

  proceedToResidenceProof() {
    if (!this.selectedFile) {
      this.uploadError = 'Please select a file for ID Proof';
      return;
    }
    this.uploadDocument();
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
        this.selectedFile = null;
        this.isUploading = false;

        // If both documents uploaded, move to success screen
        if (this.documentsUploaded['IDPROOF'] && this.documentsUploaded['RESIDENCE']) {
          setTimeout(() => {
            this.currentStep = 'success';
          }, 1000);
        } else if (this.docType === 'IDPROOF') {
          setTimeout(() => {
            this.currentStep = 'upload-residence';
            this.docType = 'RESIDENCE';
            this.uploadSuccess = false;
            this.uploadMessage = '';
          }, 1000);
        }
      },
      error: (err: any) => {
        console.error('Error uploading document:', err);
        this.uploadError = err?.error?.message || 'Failed to upload document. Please try again.';
        this.isUploading = false;
        this.uploadSuccess = false;
      }
    });
  }

  completeVerification() {
    // Redirect to login after verification is complete
    this.router.navigate(['/login']);
  }

  goBack() {
    if (this.currentStep === 'upload-residence') {
      this.currentStep = 'upload-idproof';
      this.docType = 'IDPROOF';
      this.fileURI = '';
      this.uploadError = '';
      this.uploadSuccess = false;
    } else if (this.currentStep === 'welcome') {
      this.router.navigate(['/login']);
    }
  }

  skipVerification() {
    this.router.navigate(['/citizen-dashboard']);
  }
}
