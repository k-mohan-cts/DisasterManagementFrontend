import { Routes } from '@angular/router';
import { LanderComponent } from './components/auth/lander/lander.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { DocumentVerificationComponent } from './components/auth/document-verification/document-verification.component';

export const routes: Routes = [
  { path: '', redirectTo: 'lander', pathMatch: 'full' },
  { path: 'lander', component: LanderComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'document-verification', component: DocumentVerificationComponent },

  // Citizen Dashboards
  {
    path: 'citizen-dashboard',
    loadComponent: () => import('./components/dashboard/citizen-dashboard/citizen-dashboard.component').then(m => m.CitizenDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'CITIZEN' }
  },
  {
    path: 'resources',
    loadComponent: () => import('./components/dashboard/citizen-dashboard/support-resources/support-resources.component').then(m => m.SupportResourcesComponent),
    canActivate: [authGuard],
    data: { role: 'CITIZEN' }
  },
  {
    path: 'documents',
    loadComponent: () => import('./components/dashboard/citizen-dashboard/document-vault/document-vault.component').then(m => m.DocumentVaultComponent),
    canActivate: [authGuard],
    data: { role: 'CITIZEN' }
  },
  {
    path: 'notifications',
    loadComponent: () => import('./components/dashboard/citizen-dashboard/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard],
    data: { role: 'CITIZEN' }
  },
  {
    path: 'history',
    loadComponent: () => import('./components/dashboard/citizen-dashboard/my-reports/my-reports.component').then(m => m.MyReportsComponent),
    canActivate: [authGuard],
    data: { role: 'CITIZEN' }
  },
  {
    path: 'verification',
    loadComponent: () => import('./components/dashboard/citizen-dashboard/verification/verification.component').then(m => m.VerificationComponent),
    canActivate: [authGuard],
    data: { role: 'CITIZEN' }
  },

  // Manager Dashboards
  {
    path: 'manager-dashboard',
    loadComponent: () => import('./components/dashboard/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent),
    canActivate: [authGuard]
  },{
  path: 'resources-mgmt',
  loadComponent: () => import('./components/dashboard/manager-dashboard/resources-mgmt/resources-mgmt.component').then(m => m.ResourcesMgmtComponent),
  canActivate: [authGuard]
},
  {
    path: 'emergencies',
    loadComponent: () => import('./components/dashboard/manager-dashboard/emergencies/emergencies.component').then(m => m.EmergenciesComponent),
    canActivate: [authGuard],
    data: { role: 'MANAGER' }
  },
  // Line 57 fix
{
  path: 'incidents',
  loadComponent: () => import('./components/dashboard/manager-dashboard/incidents/incidents.component')
    .then(m => m. IncidentsComponent) // Fixed: Removed extra 's'
},
  {
    path: 'resources-mgmt',
    loadComponent: () => import('./components/dashboard/manager-dashboard/resources-mgmt/resources-mgmt.component').then(m => m.ResourcesMgmtComponent),
    canActivate: [authGuard],
    data: { role: 'MANAGER' }
  },
  {
    path: 'recovery-programs',
    loadComponent: () => import('./components/dashboard/manager-dashboard/recovery-programs/recovery-programs.component').then(m => m.RecoveryProgramsComponent),
    canActivate: [authGuard],
    data: { role: 'MANAGER' }
  },

  // Officer Dashboards
  {
    path: 'officer-dashboard',
    loadComponent: () => import('./components/dashboard/officer-dashboard/officer-dashboard.component').then(m => m.OfficerDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'OFFICER' }
  },
  {
    path: 'relief-inventory',
    loadComponent: () => import('./components/dashboard/officer-dashboard/inventory/inventory.component').then(m => m.InventoryComponent),
    canActivate: [authGuard],
    data: { role: 'OFFICER' }
  },
  {
    path: 'add-relief-item',
    loadComponent: () => import('./components/dashboard/officer-dashboard/inventory/add-item-form.component').then(m => m.AddItemFormComponent),
    canActivate: [authGuard],
    data: { role: 'OFFICER' }
  },
  {
    path: 'distributions',
    loadComponent: () => import('./components/dashboard/officer-dashboard/distributions/distributions.component').then(m => m.DistributionsComponent),
    canActivate: [authGuard],
    data: { role: 'OFFICER' }
  },
  {
    path: 'create-distribution',
    loadComponent: () => import('./components/dashboard/officer-dashboard/distributions/create-distribution.component').then(m => m.CreateDistributionComponent),
    canActivate: [authGuard],
    data: { role: 'OFFICER' }
  },
  {
    path: 'shelters',
    loadComponent: () => import('./components/dashboard/officer-dashboard/shelters/shelters.component').then(m => m.SheltersComponent),
    canActivate: [authGuard],
    data: { role: 'OFFICER' }
  },
  {
    path: 'add-shelter',
    loadComponent: () => import('./components/dashboard/officer-dashboard/shelters/add-shelter.component').then(m => m.AddShelterComponent),
    canActivate: [authGuard],
    data: { role: 'OFFICER' }
  },

  // Auditor Dashboards
  {
    path: 'auditor-dashboard',
    loadComponent: () => import('./components/dashboard/auditor-dashboard/auditor-dashboard.component').then(m => m.AuditorDashboardComponent),
    canActivate: [authGuard],
    data: { role: 'AUDITOR' }
  },
  {
    path: 'compliance-records',
    loadComponent: () => import('./components/dashboard/auditor-dashboard/compliance-records/compliance-records.component').then(m => m.ComplianceRecordsComponent),
    canActivate: [authGuard],
    data: { role: 'AUDITOR' }
  },
  {
    path: 'audit-management',
    loadComponent: () => import('./components/dashboard/auditor-dashboard/audit-management/audit-management.component').then(m => m.AuditManagementComponent),
    canActivate: [authGuard],
    data: { role: 'AUDITOR' }
  },
  {
    path: 'system-logs',
    loadComponent: () => import('./components/dashboard/auditor-dashboard/system-logs/system-logs.component').then(m => m.SystemLogsComponent),
    canActivate: [authGuard],
    data: { role: 'AUDITOR' }
  },

  { path: '**', redirectTo: 'lander' }
];
