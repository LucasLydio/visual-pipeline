import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Visual Pipeline | Healthy software delivery',
    loadComponent: () =>
      import('./features/landing/pages/landing-page/landing-page.component').then(
        (module) => module.LandingPageComponent,
      ),
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/app-shell/app-shell.component').then((module) => module.AppShellComponent),
    children: [
      {
        path: '',
        title: 'Delivery overview | Visual Pipeline',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (module) => module.DashboardPageComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
