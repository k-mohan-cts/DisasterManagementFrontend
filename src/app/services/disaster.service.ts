import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {
  private gatewayUrl = 'http://localhost:8082/api';
  private reliefUrl = 'http://localhost:8082'; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // --- Citizens (ADDED FOR DROPDOWN LIST) ---
  getCitizens(): Observable<any[]> {
    // FIXED: Changed 'getallcitizens' to 'getAllCitizens' to match your backend exactly
    return this.http.get<any[]>(`${this.gatewayUrl}/citizens/getAllCitizens`, { headers: this.getHeaders() });
  }

  // --- Emergencies / Reports ---
  getEmergencies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/reports/getallreports`, { headers: this.getHeaders() });
  }

  createEmergency(report: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/reports/createReport`, report, { headers: this.getHeaders() });
  }

  updateEmergencyStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/reports/update-status/${id}?status=${status}`, {}, { headers: this.getHeaders() });
  }

  // --- Relief Items ---
  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, { headers: this.getHeaders() });
  }

  createReliefItem(item: any): Observable<any> {
    return this.http.post<any>(`${this.reliefUrl}/ReliefItems/createReliefItem`, item, { headers: this.getHeaders() });
  }

  deleteReliefItem(id: number): Observable<any> {
    return this.http.delete(`${this.reliefUrl}/ReliefItems/deleteReliefItem/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json' 
    });
  }

  // --- Distributions ---
  getDistributions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, { headers: this.getHeaders() });
  }

  createDistribution(distribution: any): Observable<any> {
    return this.http.post<any>(`${this.reliefUrl}/Distributions/createDistribution`, distribution, { headers: this.getHeaders() });
  }

  deleteDistribution(id: number): Observable<any> {
    return this.http.delete(`${this.reliefUrl}/Distributions/deleteDistribution/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json' 
    });
  }

  // --- Shelters ---
  getShelters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/shelters/getShelters`, { headers: this.getHeaders() });
  }

  createShelter(shelter: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/shelters/createShelter`, shelter, { headers: this.getHeaders() });
  }

  updateShelter(id: number, shelter: any): Observable<any> {
    return this.http.put<any>(`${this.gatewayUrl}/shelters/updateShelter/${id}`, shelter, { headers: this.getHeaders() });
  }

  deleteShelter(id: number): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/shelters/deleteShelter/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json' 
    });
  }

  // --- Audits & Resources ---
  getAudits(): Observable<any[]> { return this.http.get<any[]>(`${this.gatewayUrl}/audits/all`, { headers: this.getHeaders() }); }
  createAudit(audit: any): Observable<any> { return this.http.post(`${this.gatewayUrl}/audits/create`, audit, { headers: this.getHeaders() }); }
  getComplianceRecords(): Observable<any[]> { return this.http.get<any[]>(`${this.gatewayUrl}/compliance-records/getAllComplianceRecord`, { headers: this.getHeaders() }); }
  createComplianceRecord(record: any): Observable<any> { return this.http.post(`${this.gatewayUrl}/compliance-records/createComplianceRecord`, record, { headers: this.getHeaders() }); }
  getAuditLogs(): Observable<any> { return this.http.get<any>(`${this.gatewayUrl}/logs/GetAllLogs`, { headers: this.getHeaders() }); }
  getResources(): Observable<any[]> { return this.http.get<any[]>(`${this.gatewayUrl}/resources/viewAll`, { headers: this.getHeaders() }); }
  getIncidents(): Observable<any[]> { return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getallincident`, { headers: this.getHeaders() }); }
  getRecoveryPrograms(): Observable<any[]> { return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, { headers: this.getHeaders() }); }
}