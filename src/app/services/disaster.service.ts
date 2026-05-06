import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DisasterService {
  private gatewayUrl = 'http://localhost:8082/api';
  private reliefUrl = 'http://localhost:8082';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getRequestOptions(body?: any) {
    let headers = new HttpHeaders();

    if (!(body instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
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

  getEmergencies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/reports/getallreports`, this.getRequestOptions());
  }

  createEmergency(report: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/reports/createReport`, report, this.getRequestOptions(report));
  }

  updateEmergencyStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.gatewayUrl}/reports/update-status/${id}?status=${status}`, {}, this.getRequestOptions());
  }

  getIncidents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getallincident`, this.getRequestOptions());
  }

  getRecoveryPrograms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, this.getRequestOptions());
  }

  getResources(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/resources/viewAll`, this.getRequestOptions());
  }

  getShelters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/api/shelters/getShelters`, this.getRequestOptions());
  }

  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, this.getRequestOptions());
  }

  getDistributions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, this.getRequestOptions());
  }

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

  getAuditLogs(page?: number, size?: number): Observable<any> {
    const requestUrl = page !== undefined && size !== undefined
      ? `${this.gatewayUrl}/logs/GetAllLogs?page=${page}&size=${size}`
      : `${this.gatewayUrl}/logs/GetAllLogs`;

    return this.http.get<any>(requestUrl, this.getRequestOptions());
  }

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
