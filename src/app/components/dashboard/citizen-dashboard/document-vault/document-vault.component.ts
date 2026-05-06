import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
<<<<<<< HEAD
import { DisasterService } from '../../../../services/disaster.service';
=======
import { DocumentService } from '../../../../services/document.service';
import { AuthService } from '../../../../services/auth.service';
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2

@Component({
  selector: 'app-document-vault',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './document-vault.component.html',
  styleUrl: './document-vault.component.css'
})
export class DocumentVaultComponent implements OnInit {
<<<<<<< HEAD
  documents: any[] = [
    { name: 'Identity_Card_Front.jpg', type: 'Image', date: '15 Oct 2023', status: 'VERIFIED' },
    { name: 'Proof_of_Address.pdf', type: 'PDF', date: '16 Oct 2023', status: 'PENDING' },
    { name: 'Medical_Certificate.doc', type: 'Document', date: '10 Oct 2023', status: 'REJECTED' }
  ];

  constructor(private disasterService: DisasterService) {}

  ngOnInit() {
    // In a real scenario, we'd fetch documents for the logged-in citizen
    // For now, keeping the prototype data as fallback
=======
  documents: any[] = [];
  isLoading = true;
  citizenId: number | null = null;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.citizenId = this.authService.getUserId();
    if (this.citizenId) {
      this.loadDocuments();
    }
  }

  loadDocuments() {
    this.isLoading = true;
    if (this.citizenId) {
      this.documentService.getDocumentsByCitizenId(this.citizenId).subscribe({
        next: (data: any[]) => {
          this.documents = data.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            date: new Date(doc.uploadDate).toLocaleDateString(),
            status: doc.status || 'PENDING'
          }));
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load documents', err);
          this.isLoading = false;
        }
      });
    }
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
<<<<<<< HEAD
=======

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
        error: (err) => alert('Failed to delete document')
      });
    }
  }
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
}
