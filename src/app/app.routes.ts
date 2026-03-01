import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard'; // Importe ton nouveau garde

export const routes: Routes = [
  // --- ROUTES PUBLIQUES (Ouvertes à tous) ---
  {
    path: '',
    loadComponent: () =>
      import('./features/public/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'search-results',
    loadComponent: () =>
      import('./features/public/search-results/search-results.component').then(
        (m) => m.SearchResultsComponent,
      ),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },

  // --- ROUTES UTILISATEURS (Badge requis) ---
  {
    path: 'my-account',
    canActivate: [authGuard], // Protège tout le bloc "Mon compte"
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/user/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/user/my-bookings/my-bookings.component').then(
            (m) => m.MyBookingsComponent,
          ),
      },
    ],
  },

  // --- ROUTES PARTENAIRES (Badge requis) ---
  {
    path: 'partenaire',
    canActivate: [authGuard], // Protège le dashboard et la gestion des trajets
    children: [
    
      {
        path: 'register', // Accessible via /partenaire/register
        loadComponent: () =>
          import('./features/auth/register-partner/register-partner.component').then(
            (m) => m.RegisterPartnerComponent
          ),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/partenaire/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'trips',
        loadComponent: () =>
          import('./features/partenaire/trip-management/trip-management.component').then(
            (m) => m.TripManagementComponent,
          ),
      },
      {
        path: 'add-trip',
        loadComponent: () =>
          import('./features/partenaire/trip-management/add-form/add-trip.component').then(
            (m) => m.AddTripComponent,
          ),
      },
      
    ],
  },

  // --- ROUTE GARE / SCANNER (Badge requis) ---
  {
    path: 'gare',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/gare/scanner/scanner.component').then((m) => m.ScannerComponent),
  },

  { path: '**', redirectTo: '' },
];
