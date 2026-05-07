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

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
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
  }
  // Add this inside your DisasterService class
// Add this inside your DisasterService class

  // Incidents
 

  // Recovery Programs
  getRecoveryPrograms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/programs/viewAll`, { headers: this.getHeaders() });
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
  // Shelters
  getShelters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/shelters/getShelters`, { headers: this.getHeaders() });
  }

  // Relief Items
  getReliefItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/ReliefItems/getReliefItem`, { headers: this.getHeaders() });
  }

  // Distributions
  getDistributions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.reliefUrl}/Distributions/getDistribution`, { headers: this.getHeaders() });
  }

  // Audits
  getAudits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/audits/all`, { headers: this.getHeaders() });
  }

  createAudit(audit: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/audits/create`, audit, { headers: this.getHeaders() });
  }

  // Compliance Records
  getComplianceRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/compliance-records/getAllComplianceRecord`, { headers: this.getHeaders() });
  }

  createComplianceRecord(record: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/compliance-records/createComplianceRecord`, record, { headers: this.getHeaders() });
  }

  // Audit Logs
  getAuditLogs(): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/logs/GetAllLogs`, { headers: this.getHeaders() });
  }
// src/app/services/disaster.service.ts

createRecoveryProgram(program: any): Observable<any> {
  // Ensure the URL matches your @PostMapping in the RecoveryProgramController
  return this.http.post(`${this.gatewayUrl}/programs/create`, program, { 
    headers: this.getHeaders() 
  });
}
  // Documents
  uploadDocument(doc: any): Observable<any> {
    return this.http.post(`${this.gatewayUrl}/documents/upload`, doc, { headers: this.getHeaders() });
  }

  getDocumentById(id: number): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/documents/getDocById/${id}`, { headers: this.getHeaders() });
  }

 getIncidents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayUrl}/incidents/getallincident`, { headers: this.getHeaders() });
  }

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