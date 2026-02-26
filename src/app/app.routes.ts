import { Routes } from '@angular/router';
import { TripComponent } from './modules/trip/component/trip.component';
import { TransportDashboardComponent } from './modules/transport/dashbord/dashboard.component';
import { CompanyRegisterComponent } from './modules/transport/company/component/register.component';
// N'oublie pas d'importer ton nouveau composant :
import { VehicleRegisterComponent } from './modules/transport/vehicule/component/register.component';
import { VehicleEditComponent } from './modules/transport/vehicule/component/edit.component';
import { CompanyEditComponent } from './modules/transport/company/component/edit.component';

export const routes: Routes = [
  { path: '', component: TripComponent },
  { path: 'transport-dashboard', component: TransportDashboardComponent },
  { path: 'register-company', component: CompanyRegisterComponent },
  { path: 'edit-company/:id', component: CompanyEditComponent },
  { path: 'register-vehicle/:companyId', component: VehicleRegisterComponent },
  { path: 'edit-vehicle/:id', component: VehicleEditComponent },

  { path: '**', redirectTo: '' }
];