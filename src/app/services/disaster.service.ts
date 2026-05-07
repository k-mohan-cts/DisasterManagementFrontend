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

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
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

  // --- Citizens (ADDED FOR DROPDOWN LIST) ---
  getCitizens(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/citizens/getAllCitizens`, this.getRequestOptions());
  }

  // --- Emergencies / Reports ---
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

  // Recovery Programs
  getRecoveryPrograms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, this.getRequestOptions());
  }
// Add this inside your DisasterService
getResources(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/resources/viewAll`, {
      headers: this.getHeaders()
    });
  }
 addResource(resourceData: any, managerId: number): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/resources/add?managerId=${managerId}`, resourceData, {
      headers: this.getHeaders()
    });
  }
getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/users/getAllUsers`);
  }
  
  // --- Relief Items ---
  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, this.getRequestOptions());
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
    return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, this.getRequestOptions());
  }

  createDistribution(distribution: any): Observable<any> {
    return this.http.post<any>(`${this.reliefUrl}/Distributions/createDistribution`, distribution, this.getRequestOptions(distribution));
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
createRecoveryProgram(program: any): Observable<any> {
  // Ensure the URL matches your @PostMapping in the RecoveryProgramController
  return this.http.post(`${this.gatewayUrl}/programs/create`, program, {
    headers: this.getHeaders()
  });
}
  // Documents
  uploadDocument(doc: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/documents/upload`, doc, this.getRequestOptions(doc));
  }

  uploadCitizenDocument(documentRequest: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/documents/upload`, documentRequest, this.getRequestOptions(documentRequest));
  }

  getDocumentById(id: number): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/documents/getDocById/${id}`, this.getRequestOptions());
  }

//  getIncidents(): Observable<any[]> {
//     return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getallincident`, { headers: this.getHeaders() });
//   }

  createIncident(incident: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/incidents/createincident`, incident, { headers: this.getHeaders() });
  }

// Change this:
updateIncidentStatus(id: number, status: string): Observable<any> {
  // Get the token from storage (update key name 'token' to whatever you use)
  const token = localStorage.getItem('token');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  return this.http.put(
    `${this.gatewayUrl}/incidents/updateincident/${id}/status`,
    { status: status },
    { headers }
  );
}
deleteIncident(id: number): Observable<string> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}` // Ensure this matches your backend expectation
  });

  return this.http.delete(`${this.gatewayUrl}/incidents/delete/${id}`, {
    headers: headers,
    responseType: 'text'
  });
}


updateProgramStatus(id: number, status: string) {
  // Retrieve the token from storage (make sure the key 'token' matches your login logic)
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  // We pass the headers as the third argument
  return this.http.patch(
    `${this.gatewayUrl}/programs/update-status/${id}?status=${status}`,
    {},
    { headers }
  );
}

}
