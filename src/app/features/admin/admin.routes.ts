import { Routes } from '@angular/router';
import { TwoColumnLayoutComponent } from '../../layouts/two-column-layout/two-column-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: TwoColumnLayoutComponent,
    data: {
      sidebar: 'admin',
    },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
    ],
  },
];
