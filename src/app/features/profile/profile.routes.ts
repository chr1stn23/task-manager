import { Routes } from '@angular/router';
import { TwoColumnLayoutComponent } from '../../layouts/two-column-layout/two-column-layout.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: TwoColumnLayoutComponent,
    data: {
      sidebar: 'profile',
    },
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
