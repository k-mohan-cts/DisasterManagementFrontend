import { Routes } from '@angular/router';
import { LanderComponent } from './components/auth/lander/lander.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'lander', pathMatch: 'full' },
  { path: 'lander', component: LanderComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  
  // Citizen Dashboards
  { 
    path: 'citizen-dashboard', 
    loadComponent: () => import('./components/dashboard/citizen-dashboard/citizen-dashboard.component').then(m => m.CitizenDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'resources', 
    loadComponent: () => import('./components/dashboard/citizen-dashboard/support-resources/support-resources.component').then(m => m.SupportResourcesComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'documents', 
    loadComponent: () => import('./components/dashboard/citizen-dashboard/document-vault/document-vault.component').then(m => m.DocumentVaultComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'notifications', 
    loadComponent: () => import('./components/dashboard/citizen-dashboard/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'history', 
    loadComponent: () => import('./components/dashboard/citizen-dashboard/my-reports/my-reports.component').then(m => m.MyReportsComponent),
    canActivate: [authGuard] 
  },

  // Manager Dashboards
  { 
    path: 'manager-dashboard', 
    loadComponent: () => import('./components/dashboard/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'emergencies', 
    loadComponent: () => import('./components/dashboard/manager-dashboard/emergencies/emergencies.component').then(m => m.EmergenciesComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'incidents', 
    loadComponent: () => import('./components/dashboard/manager-dashboard/incidents/incidents.component').then(m => m.IncidentsComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'resources-mgmt', 
    loadComponent: () => import('./components/dashboard/manager-dashboard/resources-mgmt/resources-mgmt.component').then(m => m.ResourcesMgmtComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'recovery-programs', 
    loadComponent: () => import('./components/dashboard/manager-dashboard/recovery-programs/recovery-programs.component').then(m => m.RecoveryProgramsComponent),
    canActivate: [authGuard] 
  },

  // Officer Dashboards
  { 
    path: 'officer-dashboard', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/officer-dashboard.component').then(m => m.OfficerDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'relief-inventory', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/inventory/inventory.component').then(m => m.InventoryComponent),
    canActivate: [authGuard] 
  },
  { 
    // Navigation for the "Add Item" form page
    path: 'add-relief-item', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/inventory/add-item-form.component').then(m => m.AddItemFormComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'distributions', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/distributions/distributions.component').then(m => m.DistributionsComponent),
    canActivate: [authGuard] 
  },
  { 
    // Navigation for the "Create Distribution" form page
    path: 'create-distribution', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/distributions/create-distribution.component').then(m => m.CreateDistributionComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'shelters', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/shelters/shelters.component').then(m => m.SheltersComponent),
    canActivate: [authGuard] 
  },
  { 
    // FIXED: Removed the extra /add-shelter folder from the path
    path: 'add-shelter', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/shelters/add-shelter.component').then(m => m.AddShelterComponent),
    canActivate: [authGuard] 
  },

  // Auditor Dashboards
  { 
    path: 'auditor-dashboard', 
    loadComponent: () => import('./components/dashboard/auditor-dashboard/auditor-dashboard.component').then(m => m.AuditorDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'compliance-records', 
    loadComponent: () => import('./components/dashboard/auditor-dashboard/compliance-records/compliance-records.component').then(m => m.ComplianceRecordsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'audit-management', 
    loadComponent: () => import('./components/dashboard/auditor-dashboard/audit-management/audit-management.component').then(m => m.AuditManagementComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'system-logs', 
    loadComponent: () => import('./components/dashboard/auditor-dashboard/system-logs/system-logs.component').then(m => m.SystemLogsComponent),
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'lander' }
];