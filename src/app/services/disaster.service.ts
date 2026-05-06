import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {
  private gatewayUrl = 'http://localhost:8082/api';
  private reliefUrl = 'http://localhost:8082'; // For ReliefItems and Distributions which don't start with /api in Gateway

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthOptions() {
    const token = this.authService.getToken();
    return token
      ? { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) }
      : {};
  }

  // Emergencies/Reports
  getEmergencies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/reports/getallreports`, { ...this.getAuthOptions() });
  }

  createEmergency(report: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/reports/createReport`, report, { ...this.getAuthOptions() });
  }

  updateEmergencyStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/reports/update-status/${id}?status=${status}`, {}, { ...this.getAuthOptions() });
  }

  // Incidents
  getIncidents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getallincident`, { ...this.getAuthOptions() });
  }

  // Recovery Programs
  getRecoveryPrograms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, { ...this.getAuthOptions() });
  }

  // Resources
  getResources(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/resources/viewAll`, { ...this.getAuthOptions() });
  }

  // Shelters
  getShelters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/shelters/getShelters`, { ...this.getAuthOptions() });
  }

  // Relief Items
  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, { ...this.getAuthOptions() });
  }

  // Distributions
  getDistributions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, { ...this.getAuthOptions() });
  }

  // Audits
  getAudits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/audits/all`, { ...this.getAuthOptions() });
  }

  createAudit(audit: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/audits/create`, audit, { ...this.getAuthOptions() });
  }

  // Compliance Records
  getComplianceRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/compliance-records/getAllComplianceRecord`, { ...this.getAuthOptions() });
  }

  createComplianceRecord(record: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/compliance-records/createComplianceRecord`, record, { ...this.getAuthOptions() });
  }

  // Audit Logs
  getAuditLogs(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/logs/GetAllLogs?page=${page}&size=${size}`, { ...this.getAuthOptions() });
  }

  // Documents
  uploadDocument(doc: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/documents/upload`, doc, { ...this.getAuthOptions() });
  }

  getDocumentById(id: number): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/documents/getDocById/${id}`, { ...this.getAuthOptions() });
  }
}
