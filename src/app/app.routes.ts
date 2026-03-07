import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard'; // Importe ton nouveau garde
import { adminGuard } from './core/guard/admin.guard';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { AdminPartners} from './features/admin/admin-partners/admin-partners';
import { AdminUsers } from './features/admin/admin-users/admin-users';

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
        path: 'profile-edit',
        loadComponent: () =>
          import('./features/user/profile/user-edit/user-edit.component').then(
            (m) => m.UserEditComponent,
          ),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/user/my-bookings/my-bookings.component').then(
            (m) => m.MyBookingsComponent,
          ),
      },
      {
        path: 'my-tickets',
        loadComponent: () =>
          import('./features/bookings/my-tickets/my-tickets.component').then(
            (m) => m.MyTicketsComponent,
          ),
      },
    ],
  },
  // --- ROUTES PARTENAIRES (Badge requis) ---
  {
    path: 'partenaire',
    canActivate: [authGuard],
    children: [
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register-partner/register-partner.component').then(
            (m) => m.RegisterPartnerComponent,
          ),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/partenaire/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      // 💡 AJOUT DE LA ROUTE DE MODIFICATION
      {
        path: 'settings', // Accessible via /partenaire/settings
        loadComponent: () =>
          import('./features/partenaire/partner-edit/partner-edit.component').then(
            (m) => m.PartnerEditComponent,
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
          import('./features/partenaire/trip-management/trip-add/add-trip.component').then(
            (m) => m.AddTripComponent,
          ),
      },
      {
        path: 'edit-trip/:id', // URL finale: /partenaire/edit-trip/42
        loadComponent: () =>
          import('./features/partenaire/trip-management/trip-edit/trip-edit.component').then(
            (m) => m.TripEditComponent,
          ),
      },
    ],
  },

  // --- ROUTE GARE / SCANNER (Badge requis) ---
  {
    path: 'gare',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/gare/scanner/scanner.component').then((m) => m.TicketScannerComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard], // Ton guard qui vérifie le rôle ADMIN
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'users', component: AdminUsers },
      { path: 'partners', component: AdminPartners },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  {
    path: 'booking',
    canActivate: [authGuard],
    children: [
      {
        path: 'trip/:id',
        loadComponent: () =>
          import('./features/bookings/booking-trip/booking-trip.component').then(
            (m) => m.BookingTripComponent,
          ),
      },
      {
        path: 'confirmation/:id',
        loadComponent: () =>
          import('./features/bookings/booking-confirmation/booking-confirmation.component').then(
            (m) => m.BookingConfirmationComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
