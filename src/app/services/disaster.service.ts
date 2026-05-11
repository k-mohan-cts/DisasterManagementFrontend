import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {
  private gatewayUrl = 'http://localhost:8082/api';
  private reliefUrl = 'http://localhost:8082';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // --- UTILITY METHODS FOR HEADERS ---
  private getHeaders(): HttpHeaders {
    // Automatically grab the token so you don't get 401 Unauthorized errors!
    const token = localStorage.getItem('token'); 
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private getRequestOptions(body?: any) {
    let headers = this.getHeaders();
    // If it's form data (like a file upload), let the browser set the content type
    if (body instanceof FormData) {
      headers = headers.delete('Content-Type');
    }
    return { headers };
  }

  private requestWithFallbacks<T>(requestFactories: Array<() => Observable<T>>): Observable<T> {
    const [currentFactory, ...remainingFactories] = requestFactories;

    if (!currentFactory) {
      return throwError(() => new Error('No request factories provided'));
    }

    return currentFactory().pipe(
      catchError((error) => {
        if (!remainingFactories.length) {
          return throwError(() => error);
        }
        return this.requestWithFallbacks(remainingFactories);
      })
    );
  }

  // --- Citizens ---
  getCitizens(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/citizens/getAllCitizens`, this.getRequestOptions());
  }

  getAllCitizens(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/citizens/getAllCitizens`, this.getRequestOptions());
  }

  getCitizenById(id: number): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/citizens/getCitizenById/${id}`, this.getRequestOptions());
  }

  updateCitizenStatus(id: number, status: string): Observable<any> {
    const url = `${this.gatewayUrl}/citizens/updateStatus/${id}?status=${status}`;
    return this.http.patch<any>(url, {}, this.getRequestOptions());
  }

  // --- Emergencies / Reports ---
  getEmergencies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/reports/getallreports`, this.getRequestOptions());
  }

  getReportsByCitizenId(citizenId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.gatewayUrl}/reports/citizen/${citizenId}`, 
    this.getRequestOptions()
  );
}

  createEmergency(report: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/reports/createReport`, report, this.getRequestOptions(report));
  }

  updateEmergencyStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/reports/update-status/${id}?status=${status}`, {}, this.getRequestOptions());
  }

  // --- Incidents ---
  getIncidents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getallincident`, this.getRequestOptions());
  }

  createIncident(incident: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/incidents/createincident`, this.getRequestOptions());
  }

  updateIncidentStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/incidents/updateincident/${id}/status`, { status: status }, this.getRequestOptions());
  }

  deleteIncident(id: number): Observable<string> {
    return this.http.delete(`${this.gatewayUrl}/incidents/delete/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // --- Recovery Programs ---
  getRecoveryPrograms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, this.getRequestOptions());
  }

  createRecoveryProgram(program: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/programs/create`, program, this.getRequestOptions());
  }

  updateProgramStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(`${this.gatewayUrl}/programs/update-status/${id}?status=${status}`, {}, this.getRequestOptions());
  }

  // --- Resources ---
  getResources(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/resources/viewAll`, this.getRequestOptions());
  }

  addResource(resourceData: any, managerId: number): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/resources/add?managerId=${managerId}`, resourceData, this.getRequestOptions());
  }

  // --- Users ---
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/users/getAllUsers`, this.getRequestOptions());
  }

  // --- Relief Items ---
  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, this.getRequestOptions());
  }

  createReliefItem(item: any): Observable<any> {
    return this.http.post<any>(`${this.reliefUrl}/ReliefItems/createReliefItem`, item, this.getRequestOptions());
  }

  updateReliefItem(id: number, item: any): Observable<any> {
    return this.http.put<any>(`${this.reliefUrl}/ReliefItems/updateReliefItem/${id}`, item, this.getRequestOptions(item));
  }

  deleteReliefItem(id: number): Observable<any> {
    return this.http.delete(`${this.reliefUrl}/ReliefItems/deleteReliefItem/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  // --- Distributions ---
  getDistributions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, this.getRequestOptions());
  }

  createDistribution(distribution: any): Observable<any> {
    return this.http.post<any>(`${this.reliefUrl}/Distributions/createDistribution`, distribution, this.getRequestOptions(distribution));
  }

  updateDistribution(id: number, distribution: any): Observable<any> {
    return this.http.put<any>(`${this.reliefUrl}/Distributions/updateDistribution/${id}`, distribution, this.getRequestOptions(distribution));
  }

  deleteDistribution(id: number): Observable<any> {
    return this.http.delete(`${this.reliefUrl}/Distributions/deleteDistribution/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  // --- Shelters ---
  getShelters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/shelters/getShelters`, this.getRequestOptions());
  }

  createShelter(shelter: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayUrl}/shelters/createShelter`, shelter, this.getRequestOptions(shelter));
  }

  updateShelter(id: number, shelter: any): Observable<any> {
    return this.http.put<any>(`${this.gatewayUrl}/shelters/updateShelter/${id}`, shelter, this.getRequestOptions(shelter));
  }

  deleteShelter(id: number): Observable<any> {
    return this.http.delete(`${this.gatewayUrl}/shelters/deleteShelter/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  // --- Audits ---
  getAudits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/audits/all`, this.getRequestOptions());
  }

  createAudit(audit: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/audits/create`, audit, this.getRequestOptions(audit));
  }

  getAuditById(auditId: number): Observable<any> {
    return this.requestWithFallbacks([
      () => this.http.get(`${this.gatewayUrl}/audits/getAuditById/${auditId}`, this.getRequestOptions())
    ]);
  }

  updateAudit(auditId: number, audit: any): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/audits/update/${auditId}`, audit, this.getRequestOptions(audit));
  }

  // --- Compliance Records ---
  getComplianceRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/compliance-records/getAllComplianceRecord`, this.getRequestOptions());
  }

  createComplianceRecord(record: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/compliance-records/createComplianceRecord`, record, this.getRequestOptions(record));
  }

  getComplianceRecordById(recordId: number): Observable<any> {
    return this.requestWithFallbacks([
      () => this.http.get(`${this.gatewayUrl}/compliance-records/getCompliById/${recordId}`, this.getRequestOptions())
    ]);
  }

  updateComplianceRecord(recordId: number, record: any): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/compliance-records/updateComplianceRecord/${recordId}`, record, this.getRequestOptions(record));
  }

  // --- Audit Logs ---
  getAuditLogs(page?: number, size?: number): Observable<any> {
    const requestUrl = page !== undefined && size !== undefined
      ? `${this.gatewayUrl}/logs/GetAllLogs?page=${page}&size=${size}`
      : `${this.gatewayUrl}/logs/GetAllLogs`;

    return this.http.get<any>(requestUrl, this.getRequestOptions());
  }

  // --- Documents ---
  uploadDocument(doc: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/documents/upload`, doc, this.getRequestOptions(doc));
  }

  uploadCitizenDocument(documentRequest: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/documents/upload`, documentRequest, this.getRequestOptions(documentRequest));
  }

  getDocumentById(id: number): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/documents/getDocById/${id}`, this.getRequestOptions());
  }
}