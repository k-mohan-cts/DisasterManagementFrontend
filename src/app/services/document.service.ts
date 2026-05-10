import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documentApiUrl = 'http://localhost:8082/api/documents';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(`${this.documentApiUrl}/upload`, formData, this.getAuthHeaders());
  }

  getDocumentsByCitizenId(citizenId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.documentApiUrl}/getDocumentByCitizenId/${citizenId}`, this.getAuthHeaders());
  }

  getDocumentsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.documentApiUrl}/citizen/${userId}`, this.getAuthHeaders());
  }

  getAllDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.documentApiUrl}`, this.getAuthHeaders());
  }

  getDocumentById(documentId: number): Observable<any> {
    return this.http.get<any>(`${this.documentApiUrl}/getDocById/${documentId}`, this.getAuthHeaders());
  }

  updateDocumentStatus(documentId: number, status: string): Observable<any> {
    return this.http.patch(`${this.documentApiUrl}/${documentId}/status`, { status }, this.getAuthHeaders());
  }

  deleteDocument(documentId: number): Observable<any> {
    return this.http.delete(`${this.documentApiUrl}/${documentId}`, this.getAuthHeaders());
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.documentApiUrl}/${documentId}/download`, {
      ...this.getAuthHeaders(),
      responseType: 'blob' as 'blob'
    });
  }
}
