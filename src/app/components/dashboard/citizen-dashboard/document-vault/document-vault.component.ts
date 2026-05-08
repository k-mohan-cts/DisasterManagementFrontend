import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { DocumentService } from '../../../../services/document.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-document-vault',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './document-vault.component.html',
  styleUrl: './document-vault.component.css'
})
export class DocumentVaultComponent implements OnInit {
  documents: any[] = [];
  isLoading = true;
  loadError = '';
  userId: number | null = null;
  selectedDocument: any = null;
  documentBlobUrl: string | null = null;
  viewerType: 'image' | 'pdf' | null = null;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.resolveUserId();
  }

  private resolveUserId(): void {
    const currentUser = this.authService.getCurrentUser();
    const tokenUserId = currentUser?.userId || currentUser?.id;
    
    if (tokenUserId && Number(tokenUserId) > 0) {
      console.log('User ID from token:', tokenUserId);
      this.userId = Number(tokenUserId);
      this.loadDocuments();
      return;
    }

    // If userId not in token, try to get it from email
    const userEmail = this.authService.getUserEmail();
    if (userEmail) {
      console.log('Resolving User ID from email:', userEmail);
      this.authService.getUserIdByEmail(userEmail).subscribe({
        next: (id: number | null) => {
          if (id && id > 0) {
            console.log('User ID resolved from email:', id);
            this.userId = id;
            this.loadDocuments();
          } else {
            this.loadError = 'Could not resolve your user ID. Please login again.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error resolving user ID from email:', err);
          this.loadError = 'Error loading your profile. Please login again.';
          this.isLoading = false;
        }
      });
    } else {
      this.loadError = 'User ID not found. Please login again.';
      this.isLoading = false;
    }
  }

  private mapDocument(document: any) {
    return {
      documentId: document.documentId ?? document.id,
      citizenId: document.citizen?.citizenId ?? document.citizenId,
      fileName: document.fileName ?? document.name ?? document.fileURI,
      fileURI: document.fileURI ?? document.fileName,
      docType: document.docType ?? document.type ?? 'UNKNOWN',
      uploadedDate: document.uploadedDate ?? document.uploadDate,
      verificationStatus: document.verificationStatus ?? document.status ?? 'PENDING'
    };
  }

  loadDocuments() {
    this.isLoading = true;
    this.loadError = '';
    if (this.userId && this.userId > 0) {
      console.log('Loading documents for userId:', this.userId);
      this.documentService.getDocumentsByUserId(this.userId).subscribe({
        next: (data: any[]) => {
          console.log('Documents loaded successfully:', data);
          this.documents = (data || []).map((document: any) => {
            const mapped = this.mapDocument(document);
            return {
              id: mapped.documentId,
              name: mapped.fileName,
              fileURI: mapped.fileURI,
              type: mapped.docType,
              date: mapped.uploadedDate ? new Date(mapped.uploadedDate).toLocaleDateString() : '-',
              status: mapped.verificationStatus,
              fileContent: document.fileContent // Store full base64 content
            };
          });
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Failed to load documents', err);
          this.loadError = 'Failed to load your documents.';
          this.documents = [];
          this.isLoading = false;
        }
      });
    } else {
      console.error('Invalid userId, cannot load documents');
      this.isLoading = false;
    }
  }

  getStatusClass(status: string): string {
    return (status || '').toLowerCase();
  }

  downloadDocument(documentId: number, documentName: string) {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documentName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Download failed', err)
    });
  }

  deleteDocument(documentId: number) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(documentId).subscribe({
        next: () => {
          alert('Document deleted successfully!');
          this.loadDocuments();
        },
        error: () => alert('Failed to delete document')
      });
    }
  }

  viewDocument(doc: any) {
    this.selectedDocument = doc;
    
    if (!doc.fileContent) {
      console.error('No file content available for document:', doc.id);
      alert('File content not available');
      return;
    }

    try {
      // Convert base64 to blob
      const binaryString = atob(doc.fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Determine MIME type based on document type
      let mimeType = 'application/octet-stream';
      if (doc.type && doc.type.toUpperCase() === 'PDF') {
        mimeType = 'application/pdf';
        this.viewerType = 'pdf';
      } else if (doc.type && (doc.type.toUpperCase().includes('IMAGE') || doc.type.toUpperCase().includes('IDPROOF') || doc.type.toUpperCase().includes('RESIDENCE'))) {
        // Check the actual content to determine image type
        if (doc.fileContent.startsWith('iVBORw0KGgo')) {
          mimeType = 'image/png';
        } else if (doc.fileContent.startsWith('/9j/')) {
          mimeType = 'image/jpeg';
        } else {
          mimeType = 'image/png'; // Default to PNG
        }
        this.viewerType = 'image';
      }

      const blob = new Blob([bytes], { type: mimeType });
      this.documentBlobUrl = window.URL.createObjectURL(blob);
      console.log('Document viewer opened for:', doc.name, 'Type:', this.viewerType);
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Error loading document. Invalid file format.');
      this.selectedDocument = null;
    }
  }

  closeDocumentViewer() {
    if (this.documentBlobUrl) {
      window.URL.revokeObjectURL(this.documentBlobUrl);
    }
    this.selectedDocument = null;
    this.documentBlobUrl = null;
    this.viewerType = null;
  }}