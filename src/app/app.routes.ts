import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { ApprovalGuard } from './core/guards/approval.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Landing page route (public)
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule)
  },
  
  // Auth routes
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadChildren: () => import('./features/auth/login/login.module').then(m => m.LoginModule)
      },
      {
        path: 'register',
        loadChildren: () => import('./features/auth/register/register.module').then(m => m.RegisterModule)
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('./features/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule)
      },
      {
        path: 'reset-password',
        loadChildren: () => import('./features/auth/reset-password/reset-password.module').then(m => m.ResetPasswordModule)
      },
      {
        path: 'pending-approval',
        loadChildren: () => import('./features/auth/pending-approval/pending-approval.module').then(m => m.PendingApprovalModule)
      }
    ]
  },
  
  // Main application routes
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, ApprovalGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'clients',
        loadChildren: () => import('./features/clients/clients.module').then(m => m.ClientsModule)
      },
      {
        path: 'appointments',
        loadChildren: () => import('./features/appointments/appointments.module').then(m => m.AppointmentsModule)
      },
      {
        path: 'forms',
        loadChildren: () => import('./features/forms/forms.module').then(m => m.FormsModule)
      },
      {
        path: 'notes',
        loadChildren: () => import('./features/notes/notes.module').then(m => m.NotesModule)
      },
      {
        path: 'billing',
        loadChildren: () => import('./features/billing/billing.module').then(m => m.BillingModule)
      },
      {
        path: 'reviews',
        loadChildren: () => import('./features/reviews/reviews.module').then(m => m.ReviewsModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
      }
    ]
  },
  
  // Admin routes
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [AuthGuard, ApprovalGuard, AdminGuard],
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  
  // Wildcard route
  {
    path: '**',
    redirectTo: ''
  }
];
