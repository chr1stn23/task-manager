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
          import('./pages/dashboard/admin-dashboard-page/admin-dashboard-page.component').then(
            (m) => m.AdminDashboardPageComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/admin-users-page/admin-users-page.component').then(
            (m) => m.AdminUsersPageComponent,
          ),
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./pages/users/admin-user-detail-page/admin-user-detail-page.component').then(
            (m) => m.AdminUserDetailPageComponent,
          ),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./pages/tasks/admin-tasks-page/admin-tasks-page.component').then(
            (m) => m.AdminTasksPageComponent,
          ),
      },
    ],
  },
];
