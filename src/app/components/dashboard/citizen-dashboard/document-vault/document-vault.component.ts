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
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
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
        error: (err) => alert('Failed to delete document')
      });
    }
  }
}
