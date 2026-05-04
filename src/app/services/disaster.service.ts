import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {
  private gatewayUrl = 'http://localhost:8082/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Emergencies/Reports
  getEmergencies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/reports/getAllReports`, { headers: this.getHeaders() });
  }

  createEmergency(report: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/reports/createReport`, report, { headers: this.getHeaders() });
  }

  updateEmergencyStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/reports/update-status/${id}?status=${status}`, {}, { headers: this.getHeaders() });
  }

  // Incidents
  getIncidents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getAllIncidents`, { headers: this.getHeaders() });
  }

  // Recovery Programs
  getRecoveryPrograms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/programs/getAllPrograms`, { headers: this.getHeaders() });
  }

  // Resources
  getResources(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/resources/getAllResources`, { headers: this.getHeaders() });
  }

  // Shelters
  getShelters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/shelters/getAllShelters`, { headers: this.getHeaders() });
  }

  // Relief Items
  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/ReliefItems/getAllReliefItems`, { headers: this.getHeaders() });
  }

  // Distributions
  getDistributions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/Distributions/getAllDistributions`, { headers: this.getHeaders() });
  }

  // Audits
  getAudits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/audits/all`, { headers: this.getHeaders() });
  }

  // Compliance Records
  getComplianceRecords(): Observable<any[]> {
    // Assuming this endpoint exists based on the controller names
    return this.http.get<any[]>(`${this.gatewayUrl}/compliance-records/all`, { headers: this.getHeaders() });
  }

  // Audit Logs
  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/logs/all`, { headers: this.getHeaders() });
  }
}
