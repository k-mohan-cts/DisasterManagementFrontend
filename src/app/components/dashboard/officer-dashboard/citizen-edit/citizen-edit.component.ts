// citizen-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DisasterService } from '../../../../services/disaster.service';
import { DocumentService } from '../../../../services/document.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-citizen-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './citizen-edit.component.html',
  styleUrls: ['./citizen-edit.component.css']
})
export class CitizenEditComponent implements OnInit {
  citizenId!: number;
  citizen: any = { name: '', status: '' }; 
  saving = false;
  loading = true;
  documents: any[] = [];
  allDocuments: any[] = [];
  showAllDocumentsModal = false;
  allDocumentsLoading = false;
  selectedDocument: any = null;
  documentBlobUrl: string | null = null;
  sanitizedDocumentUrl: SafeResourceUrl | null = null;
  viewerType: 'image' | 'pdf' | null = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private service: DisasterService,
    private documentService: DocumentService,
    private sanitizer: DomSanitizer
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state?.['citizen']) {
      this.citizen = { ...nav.extras.state['citizen'] };
      this.loading = false;
    }
  }

  ngOnInit(): void {
    // Get ID from the URL path: /officer/citizens/edit/:citizenId
    const idParam = this.route.snapshot.paramMap.get('citizenId');
    this.citizenId = Number(idParam);

    if (!idParam || isNaN(this.citizenId)) {
      this.router.navigate(['/citizens']);
      return;
    }

    // If citizen wasn't passed via state, fetch it from API
    if (this.loading) {
      this.service.getCitizenById(this.citizenId).subscribe({
        next: (data) => {
          this.citizen = data;
          this.loading = false;
          this.loadDocuments();
        },
        error: (err) => {
          console.error('Fetch Error:', err);
          alert('Could not load citizen details.');
          this.router.navigate(['/citizens']);
        }
      });
    } else {
      // citizen was provided via navigation state — ensure documents load
      this.loadDocuments();
    }
  }

  private loadDocuments(): void {
    // Use DocumentService to list documents for this citizen
    this.documents = [];
    // Try citizen-specific endpoint first, then fallback to user-style endpoint
    this.documentService.getDocumentsByCitizenId(this.citizenId).subscribe({
      next: (docs) => {
        if (docs && docs.length > 0) {
          this.documents = (docs || []).map((d: any) => ({
            id: d.documentId ?? d.id,
            name: d.fileName ?? d.name ?? d.fileURI,
            type: d.docType ?? d.type ?? 'UNKNOWN',
            date: d.uploadedDate ?? d.uploadDate ?? d.createdAt,
            status: d.verificationStatus ?? d.status,
            fileContent: d.fileContent // may be present
          }));
          return;
        }

        // Fallback to userId endpoint
        this.documentService.getDocumentsByUserId(this.citizenId).subscribe({
          next: (udocs) => {
            this.documents = (udocs || []).map((d: any) => ({
              id: d.documentId ?? d.id,
              name: d.fileName ?? d.name ?? d.fileURI,
              type: d.docType ?? d.type ?? 'UNKNOWN',
              date: d.uploadedDate ?? d.uploadDate ?? d.createdAt,
              status: d.verificationStatus ?? d.status,
              fileContent: d.fileContent
            }));
          },
          error: (err) => {
            console.error('Fallback document load failed', err);
            this.documents = [];
          }
        });
      },
      error: (err) => {
        console.error('Primary document load failed, attempting fallback', err);
        // try fallback
        this.documentService.getDocumentsByUserId(this.citizenId).subscribe({
          next: (udocs) => {
            this.documents = (udocs || []).map((d: any) => ({
              id: d.documentId ?? d.id,
              name: d.fileName ?? d.name ?? d.fileURI,
              type: d.docType ?? d.type ?? 'UNKNOWN',
              date: d.uploadedDate ?? d.uploadDate ?? d.createdAt,
              status: d.verificationStatus ?? d.status,
              fileContent: d.fileContent
            }));
          },
          error: (err2) => {
            console.error('Fallback document load failed', err2);
            this.documents = [];
          }
        });
      }
    });
  }

  openAllDocuments(): void {
    this.showAllDocumentsModal = true;
    this.allDocumentsLoading = true;
    this.allDocuments = [];
    this.documentService.getDocumentsByCitizenId(this.citizenId).subscribe({
      next: (list: any[]) => {
        this.allDocuments = (list || []).map((d: any) => ({
          id: d.documentId ?? d.id,
          name: d.fileName ?? d.name ?? d.fileURI,
          type: d.docType ?? d.type ?? 'UNKNOWN',
          date: d.uploadedDate ?? d.uploadDate ?? d.createdAt,
          fileContent: d.fileContent
        }));
        this.allDocumentsLoading = false;
      },
      error: (err) => {
        console.error('Failed to load all documents for citizen', err);
        this.allDocuments = [];
        this.allDocumentsLoading = false;
      }
    });
  }

  closeAllDocuments(): void {
    this.showAllDocumentsModal = false;
    this.allDocuments = [];
    this.allDocumentsLoading = false;
  }

  downloadFromAll(doc: any): void {
    // prefer download endpoint
    const id = doc.id;
    // if the blob is already available in memory for this doc, use it
    if (doc.fileContent && this.documentBlobUrl && this.selectedDocument && (this.selectedDocument.id === id || this.selectedDocument.name === doc.name)) {
      const link = document.createElement('a');
      link.href = this.documentBlobUrl;
      link.download = doc.name || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name || 'document';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Download failed', err)
    });
  }

  viewDocument(doc: any): void {
    // if the all-docs modal is open, close it before opening the viewer
    if (this.showAllDocumentsModal) this.closeAllDocuments();

    this.selectedDocument = doc;

    const processBase64 = (base64: string) => {
      try {
        // strip data:<mime>;base64, prefix if present
        const cleaned = base64.includes(',') ? base64.split(',').pop() as string : base64;
        const binaryString = atob(cleaned);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        let mimeType = 'application/octet-stream';
        // prefer explicit type field
        if (doc.type && String(doc.type).toUpperCase() === 'PDF') {
          mimeType = 'application/pdf';
          this.viewerType = 'pdf';
        } else if (doc.type && String(doc.type).toUpperCase().includes('IMAGE')) {
          if (base64.startsWith('iVBORw0KGgo')) mimeType = 'image/png';
          else if (base64.startsWith('/9j/')) mimeType = 'image/jpeg';
          else mimeType = 'image/png';
          this.viewerType = 'image';
        } else {
          // if no type provided, try to guess from filename
          const name = String(doc.name || '').toLowerCase();
          if (name.endsWith('.pdf')) {
            mimeType = 'application/pdf';
            this.viewerType = 'pdf';
          } else if (name.match(/\.(png|jpg|jpeg|gif)$/)) {
            if (name.endsWith('.png')) mimeType = 'image/png';
            else if (name.endsWith('.jpg') || name.endsWith('.jpeg')) mimeType = 'image/jpeg';
            else if (name.endsWith('.gif')) mimeType = 'image/gif';
            this.viewerType = 'image';
          }
        }
        const blob = new Blob([bytes], { type: mimeType });
        if (this.documentBlobUrl) URL.revokeObjectURL(this.documentBlobUrl);
        this.documentBlobUrl = URL.createObjectURL(blob);
        this.sanitizedDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentBlobUrl);
        console.log('Document blob created', { mimeType, url: this.documentBlobUrl, viewerType: this.viewerType });
      } catch (err) {
        console.error('Error processing base64', err);
        alert('Could not load document');
        this.selectedDocument = null;
      }
    };

    if (doc.fileContent) {
      processBase64(doc.fileContent);
      return;
    }

    // First try to fetch documents for this citizen and locate the requested one
    this.documentService.getDocumentsByCitizenId(this.citizenId).subscribe({
      next: (list: any[]) => {
        const found = (list || []).find((d: any) => (d.documentId === doc.id || d.id === doc.id || d.fileName === doc.name || d.name === doc.name));
        const base64 = found && (found.fileContent || found.base64 || found.data || found.file || found.fileContentBase64);
        if (base64) {
          processBase64(base64);
          return;
        }

        // If not present in the citizen list, try the document-by-id endpoint
        this.documentService.getDocumentById(doc.id).subscribe({
          next: (res: any) => {
            const base64FromId = res.fileContent || res.base64 || res.data || res.file || res.fileContentBase64;
            if (base64FromId) {
              processBase64(base64FromId);
              return;
            }

            // fallback to binary download
            this.documentService.downloadDocument(doc.id).subscribe({
              next: (blob) => {
                if (this.documentBlobUrl) URL.revokeObjectURL(this.documentBlobUrl);
                this.documentBlobUrl = URL.createObjectURL(blob);
                this.sanitizedDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentBlobUrl);
                const mime = blob.type || '';
                if (mime.includes('pdf')) this.viewerType = 'pdf';
                else if (mime.startsWith('image/')) this.viewerType = 'image';
                else this.viewerType = null;
              },
              error: (err) => {
                console.error('Download failed', err);
                alert('Could not retrieve document');
                this.selectedDocument = null;
              }
            });
          },
          error: (err) => {
            console.error('Failed to fetch document by id', err);
            // As a last resort, try binary download
            this.documentService.downloadDocument(doc.id).subscribe({
              next: (blob) => {
                if (this.documentBlobUrl) URL.revokeObjectURL(this.documentBlobUrl);
                this.documentBlobUrl = URL.createObjectURL(blob);
                this.sanitizedDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentBlobUrl);
                const mime = blob.type || '';
                if (mime.includes('pdf')) this.viewerType = 'pdf';
                else if (mime.startsWith('image/')) this.viewerType = 'image';
                else this.viewerType = null;
              },
              error: (err2) => {
                console.error('Download failed (final fallback)', err2);
                alert('Could not retrieve document');
                this.selectedDocument = null;
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Primary citizen-document list fetch failed, falling back to id endpoint', err);
        // fallback to document-by-id directly
        this.documentService.getDocumentById(doc.id).subscribe({
          next: (res: any) => {
            const base64 = res.fileContent || res.base64 || res.data || res.file || res.fileContentBase64;
            if (base64) {
              processBase64(base64);
              return;
            }
            this.documentService.downloadDocument(doc.id).subscribe({
              next: (blob) => {
                if (this.documentBlobUrl) URL.revokeObjectURL(this.documentBlobUrl);
                this.documentBlobUrl = URL.createObjectURL(blob);
                this.sanitizedDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentBlobUrl);
                const mime = blob.type || '';
                if (mime.includes('pdf')) this.viewerType = 'pdf';
                else if (mime.startsWith('image/')) this.viewerType = 'image';
                else this.viewerType = null;
              },
              error: (err2) => {
                console.error('Download failed', err2);
                alert('Could not retrieve document');
                this.selectedDocument = null;
              }
            });
          },
          error: (err2) => {
            console.error('Failed to fetch document by id', err2);
            alert('Could not retrieve document');
            this.selectedDocument = null;
          }
        });
      }
    });
  }

  downloadDocument(): void {
    if (!this.selectedDocument) return;
    const id = this.selectedDocument.id;

    // If we already created a blob URL for the document (shown in modal), use it to download.
    if (this.documentBlobUrl) {
      const link = document.createElement('a');
      link.href = this.documentBlobUrl;
      link.download = this.selectedDocument.name || 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    // otherwise fetch from server
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.selectedDocument.name || 'document';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed', err);
        alert('Download failed');
      }
    });
  }

  closeDocumentViewer(): void {
    if (this.documentBlobUrl) {
      URL.revokeObjectURL(this.documentBlobUrl);
      this.documentBlobUrl = null;
      this.sanitizedDocumentUrl = null;
    }
    this.selectedDocument = null;
    this.viewerType = null;
  }

  updateCitizen(): void {
    if (!this.citizen.status) return;
    this.saving = true;
    
    this.service.updateCitizenStatus(this.citizenId, this.citizen.status).subscribe({
      next: () => {
        alert('Status updated successfully!');
        this.router.navigate(['/citizens']);
      },
      error: (err) => {
        this.saving = false;
        console.error('Update Error:', err);
        alert('Update failed: ' + (err.error?.message || 'Server error'));
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/citizens']);
  }
}