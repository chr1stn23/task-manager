import { Routes } from '@angular/router';
import { ProfileLayoutComponent } from './profile-layout/profile-layout.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/profile-overview/profile-overview.component').then(
            (m) => m.ProfileOverviewComponent,
          ),
      },
      {
        path: 'edit',
        loadComponent: () =>
          import('./pages/profile-edit/profile-edit.component').then((m) => m.ProfileEditComponent),
      },
      {
        path: 'security',
        loadComponent: () =>
          import('./pages/profile-security/profile-security.component').then(
            (m) => m.ProfileSecurityComponent,
          ),
      },
    ],
  },
];
