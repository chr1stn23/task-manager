import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features//auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features//auth/register/register.component').then((m) => m.RegisterComponent),
  },

  // Protected routes (requires authentication)
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/task-list/task-list.component').then((m) => m.TaskListComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },

  // Admin routes (requires authentication and admin role)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  // Default redirect and 404 error handling
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
