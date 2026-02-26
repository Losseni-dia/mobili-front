import { Routes } from '@angular/router';
import { TripComponent } from './modules/trip/component/trip.component';
import { TransportDashboardComponent } from './modules/transport/dashbord/dashboard.component';

export const routes: Routes = [
  { path: '', component: TripComponent },
  { path: 'transport-dashboard', component: TransportDashboardComponent },
  { path: '**', redirectTo: '' }
];