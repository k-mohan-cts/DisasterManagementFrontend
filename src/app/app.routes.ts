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
  { 
    path: 'citizen-dashboard', 
    loadComponent: () => import('./components/dashboard/citizen-dashboard/citizen-dashboard.component').then(m => m.CitizenDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'manager-dashboard', 
    loadComponent: () => import('./components/dashboard/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'officer-dashboard', 
    loadComponent: () => import('./components/dashboard/officer-dashboard/officer-dashboard.component').then(m => m.OfficerDashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'auditor-dashboard', 
    loadComponent: () => import('./components/dashboard/auditor-dashboard/auditor-dashboard.component').then(m => m.AuditorDashboardComponent),
    canActivate: [authGuard]
  },
  { path: 'incidents', component: ManagerDashboardComponent, canActivate: [authGuard] },
  { path: 'resources-mgmt', component: ManagerDashboardComponent, canActivate: [authGuard] },
  { path: 'recovery-programs', component: ManagerDashboardComponent, canActivate: [authGuard] },
  { path: 'relief-inventory', component: OfficerDashboardComponent, canActivate: [authGuard] },
  { path: 'distributions', component: OfficerDashboardComponent, canActivate: [authGuard] },
  { path: 'shelters', component: OfficerDashboardComponent, canActivate: [authGuard] },
  { path: 'resources', component: CitizenDashboardComponent, canActivate: [authGuard] },
  { path: 'documents', component: CitizenDashboardComponent, canActivate: [authGuard] },
  { path: 'notifications', component: CitizenDashboardComponent, canActivate: [authGuard] },
  { path: 'history', component: CitizenDashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'lander' }
];
