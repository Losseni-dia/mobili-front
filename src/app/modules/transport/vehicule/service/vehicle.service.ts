import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../model/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private readonly ENDPOINT = '/vehicles';

  // Récupérer les véhicules d'une compagnie spécifique
  getByCompany(companyId: number): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.ENDPOINT}/company/${companyId}`);
  }

  // Mettre à jour la disponibilité (Mobile First: pour l'app chauffeur plus tard)
  updateAvailability(id: number, available: boolean): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.ENDPOINT}/${id}/availability`, { available });
  }

  // Créer un véhicule
  create(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.ENDPOINT, vehicle);
  }
}