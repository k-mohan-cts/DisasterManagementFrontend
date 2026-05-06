import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {
  private gatewayUrl = 'http://localhost:8082/api';
<<<<<<< HEAD
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
=======
  private reliefUrl = 'http://localhost:8082'; // Base URL for Relief Items, Distributions, and Shelters

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
  let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  const token = this.authService.getToken();
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

  // Emergencies/Reports
  getEmergencies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/reports/getallreports`, { headers: this.getHeaders() });
  }

  createEmergency(report: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/reports/createReport`, report, { headers: this.getHeaders() });
  }

  updateEmergencyStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/reports/update-status/${id}?status=${status}`, {}, { headers: this.getHeaders() });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  // Incidents
  getIncidents(): Observable<any[]> {
<<<<<<< HEAD
    return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getallincident`, { ...this.getAuthOptions() });
=======
    return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getallincident`, { headers: this.getHeaders() });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  // Recovery Programs
  getRecoveryPrograms(): Observable<any[]> {
<<<<<<< HEAD
    return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, { ...this.getAuthOptions() });
=======
    return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, { headers: this.getHeaders() });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  // Resources
  getResources(): Observable<any[]> {
<<<<<<< HEAD
    return this.http.get<any[]>(`${this.gatewayUrl}/resources/viewAll`, { ...this.getAuthOptions() });
=======
    return this.http.get<any[]>(`${this.gatewayUrl}/resources/viewAll`, { headers: this.getHeaders() });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  // Shelters
  getShelters(): Observable<any[]> {
<<<<<<< HEAD
    return this.http.get<any[]>(`${this.gatewayUrl}/shelters/getShelters`, { ...this.getAuthOptions() });
  }

  // Relief Items
  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, { ...this.getAuthOptions() });
=======
  const token = this.authService.getToken();
  console.log('Shelter token:', token);
  return this.http.get<any[]>(`${this.reliefUrl}/api/shelters/getShelters`, { headers: this.getHeaders() });
}

  // Relief Items
  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, { headers: this.getHeaders() });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  // Distributions
  getDistributions(): Observable<any[]> {
<<<<<<< HEAD
    return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, { ...this.getAuthOptions() });
=======
    return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, { headers: this.getHeaders() });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  // Audits
  getAudits(): Observable<any[]> {
<<<<<<< HEAD
    return this.http.get<any[]>(`${this.gatewayUrl}/audits/all`, { ...this.getAuthOptions() });
  }

  createAudit(audit: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/audits/create`, audit, { ...this.getAuthOptions() });
=======
    return this.http.get<any[]>(`${this.gatewayUrl}/audits/all`, { headers: this.getHeaders() });
  }

  createAudit(audit: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/audits/create`, audit, { headers: this.getHeaders() });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  // Compliance Records
  getComplianceRecords(): Observable<any[]> {
<<<<<<< HEAD
    return this.http.get<any[]>(`${this.gatewayUrl}/compliance-records/getAllComplianceRecord`, { ...this.getAuthOptions() });
  }

  createComplianceRecord(record: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/compliance-records/createComplianceRecord`, record, { ...this.getAuthOptions() });
  }

  // Audit Logs
  getAuditLogs(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/logs/GetAllLogs?page=${page}&size=${size}`, { ...this.getAuthOptions() });
=======
    return this.http.get<any[]>(`${this.gatewayUrl}/compliance-records/getAllComplianceRecord`, { headers: this.getHeaders() });
  }

  createComplianceRecord(record: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/compliance-records/createComplianceRecord`, record, { headers: this.getHeaders() });
  }

  // Audit Logs
  getAuditLogs(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/logs/GetAllLogs`, { headers: this.getHeaders() });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }

  // Documents
  uploadDocument(doc: any): Observable<any> {
<<<<<<< HEAD
    return this.http.post(`${this.gatewayUrl}/documents/upload`, doc, { ...this.getAuthOptions() });
  }

  getDocumentById(id: number): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/documents/getDocById/${id}`, { ...this.getAuthOptions() });
=======
    return this.http.post(`${this.gatewayUrl}/documents/upload`, doc, { headers: this.getHeaders() });
  }

  // Upload Citizen Document for Verification
  uploadCitizenDocument(documentRequest: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/documents/upload`, documentRequest, { headers: this.getHeaders() });
  }

  getDocumentById(id: number): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/documents/getDocById/${id}`, { headers: this.getHeaders() });
>>>>>>> 7543fd4b73c987159bd25f87895f6ff4d0c58ee2
  }
}
