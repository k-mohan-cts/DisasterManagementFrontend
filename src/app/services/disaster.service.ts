import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {
  private gatewayUrl = 'http://localhost:8082/api';
  // For ReliefItems and Distributions which don't start with /api in Gateway
  private reliefUrl = 'http://localhost:8082'; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // --- Emergencies/Reports ---
  getEmergencies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/reports/getallreports`, { headers: this.getHeaders() });
  }

  createEmergency(report: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/reports/createReport`, report, { headers: this.getHeaders() });
  }

  updateEmergencyStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/reports/update-status/${id}?status=${status}`, {}, { headers: this.getHeaders() });
  }

  // --- Incidents ---
  getIncidents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getallincident`, { headers: this.getHeaders() });
  }

  // --- Recovery Programs ---
  getRecoveryPrograms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, { headers: this.getHeaders() });
  }

  // --- Resources ---
  getResources(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/resources/viewAll`, { headers: this.getHeaders() });
  }

  // --- Shelters ---
  getShelters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/shelters/getShelters`, { headers: this.getHeaders() });
  }

  // --- Relief Items ---
  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, { headers: this.getHeaders() });
  }

  // --- Distributions ---
  getDistributions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, { headers: this.getHeaders() });
  }

  // --- Audits ---
  getAudits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/audits/all`, { headers: this.getHeaders() });
  }

  createAudit(audit: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/audits/create`, audit, { headers: this.getHeaders() });
  }

  // --- Compliance Records ---
  getComplianceRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/compliance-records/getAllComplianceRecord`, { headers: this.getHeaders() });
  }

  createComplianceRecord(record: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/compliance-records/createComplianceRecord`, record, { headers: this.getHeaders() });
  }

  // --- Audit Logs ---
  getAuditLogs(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/logs/GetAllLogs`, { headers: this.getHeaders() });
  }

  // --- Documents ---
  uploadDocument(doc: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/documents/upload`, doc, { headers: this.getHeaders() });
  }

  getDocumentById(id: number): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/documents/getDocById/${id}`, { headers: this.getHeaders() });
  }

  // --- Citizen Management ---
  getCitizenById(id: number): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/citizens/getCitizenById/${id}`, { headers: this.getHeaders() });
  }

  getAllCitizens(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/citizens/getAllCitizens`, { headers: this.getHeaders() });
  }

  updateCitizenStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(
      `${this.gatewayUrl}/citizens/updateStatus/${id}?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}