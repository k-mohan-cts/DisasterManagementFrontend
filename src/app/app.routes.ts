import { Routes } from '@angular/router';
import { LanderComponent } from './components/auth/lander/lander.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { CitizenDashboardComponent } from './components/dashboard/citizen-dashboard/citizen-dashboard.component';
import { ManagerDashboardComponent } from './components/dashboard/manager-dashboard/manager-dashboard.component';
import { OfficerDashboardComponent } from './components/dashboard/officer-dashboard/officer-dashboard.component';

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
    path: 'distributions', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/distributions/distributions.component').then(m => m.DistributionsComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'shelters', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/shelters/shelters.component').then(m => m.SheltersComponent),
    canActivate: [authGuard] 
  },

  // Auditor Dashboards
  { 
    path: 'auditor-dashboard', 
    loadComponent: () => import('./components/dashboard/auditor-dashboard/auditor-dashboard.component').then(m => m.AuditorDashboardComponent),
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'lander' }
];
