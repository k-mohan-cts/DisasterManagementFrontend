import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DisasterService } from '../../../services/disaster.service';

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

  currentStep: 'welcome' | 'choose-document' | 'upload' | 'pending' | 'success' = 'welcome';
  documentsUploaded: { IDPROOF?: boolean; RESIDENCE?: boolean } = {};

  constructor(
    private authService: AuthService,
    private disasterService: DisasterService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.citizenId = await this.resolveUserId();
    console.log('Document Verification - UserId:', this.citizenId);

    this.currentStep = 'choose-document';
  }

  selectDocumentType(docType: 'IDPROOF' | 'RESIDENCE') {
    this.docType = docType;
    this.fileURI = '';
    this.selectedFile = null;
    this.uploadError = '';
    this.uploadSuccess = false;
    this.uploadMessage = '';
    this.currentStep = 'upload';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  uploadDocument() {
    if (!this.selectedFile) {
      this.uploadError = 'Please select a file before uploading';
      return;
    }

    if (!this.citizenId || this.citizenId <= 0) {
      this.uploadError = `Citizen ID is invalid (${this.citizenId}). Please log in again before uploading.`;
      console.error('Upload blocked: invalid citizenId:', this.citizenId);
      return;
    }

    this.isUploading = true;
    this.uploadError = '';
    this.uploadMessage = '';

    // Create FormData for blob-based file upload (matching backend expectations)
    const formData = new FormData();
    formData.append('citizenId', String(this.citizenId));
    formData.append('docType', this.docType);
    formData.append('fileURI', this.selectedFile, this.selectedFile.name);
    formData.append('verificationStatus', 'PENDING');

    // Log detailed FormData content for debugging
    console.log('=== UPLOADING DOCUMENT ===');
    console.log('CitizenId:', this.citizenId, 'Type:', typeof this.citizenId);
    console.log('DocType:', this.docType);
    console.log('File:', this.selectedFile.name, 'Size:', this.selectedFile.size, 'Type:', this.selectedFile.type);
    console.log('VerificationStatus: PENDING');
    console.log('FormData entries:');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${(value as File).name} (${(value as File).size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    console.log('=== END UPLOAD DETAILS ===');

    this.disasterService.uploadCitizenDocument(formData).subscribe({
      next: (response: any) => {
        console.log('✅ Document uploaded successfully:', response);
        this.documentsUploaded[this.docType] = true;
        this.uploadSuccess = true;
        this.uploadMessage = `${this.docType} document uploaded successfully!`;
        this.fileURI = '';
        this.selectedFile = null;
        this.isUploading = false;

        // Move to the document vault / pending approval page
        setTimeout(() => {
          this.router.navigate(['/documents']);
        }, 1000);
      },
      error: (err: any) => {
        console.error('❌ Error uploading document:', err);
        
        // Extract detailed error info from backend
        let errorMsg = 'Failed to upload document. Please try again.';
        
        if (err?.error?.details) {
          console.error('Backend validation details:', err.error.details);
          errorMsg = JSON.stringify(err.error.details);
        } else if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.error?.error) {
          errorMsg = err.error.error;
        }
        
        this.uploadError = errorMsg;
        this.isUploading = false;
        this.uploadSuccess = false;
      }
    });
  }

  private async resolveUserId(): Promise<number> {
    const currentUser = this.authService.getCurrentUser();
    const directId = currentUser?.userId || currentUser?.id;
    if (directId && Number(directId) > 0) {
      return Number(directId);
    }

    // Try to resolve userId from email
    return await new Promise<number>((resolve) => {
      this.authService.getUserIdByEmail().subscribe({
        next: (resolvedId) => {
          if (resolvedId && resolvedId > 0) {
            resolve(Number(resolvedId));
          } else {
            resolve(0);
          }
        },
        error: () => resolve(0)
      });
    });
  }

  completeVerification() {
    // Redirect to login after verification is complete
    this.router.navigate(['/login']);
  }

  goBack() {
    if (this.currentStep === 'upload') {
      this.currentStep = 'choose-document';
      this.fileURI = '';
      this.selectedFile = null;
      this.uploadError = '';
      this.uploadSuccess = false;
    } else if (this.currentStep === 'choose-document' || this.currentStep === 'welcome') {
      this.router.navigate(['/login']);
    }
  }

  uploadAnother() {
    this.currentStep = 'choose-document';
    this.fileURI = '';
    this.selectedFile = null;
    this.uploadError = '';
    this.uploadSuccess = false;
    this.uploadMessage = '';
  }

  skipVerification() {
    this.router.navigate(['/citizen-dashboard']);
  }
}
