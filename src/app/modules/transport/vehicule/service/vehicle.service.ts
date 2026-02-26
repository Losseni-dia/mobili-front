import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicle } from '../model/vehicle.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private http = inject(HttpClient);
  private readonly ENDPOINT = '/vehicles';

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.ENDPOINT}/${id}`);
  }

  // Récupérer les véhicules d'une compagnie spécifique
  getByCompany(companyId: number): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.ENDPOINT}/company/${companyId}`);
  }

  // Mettre à jour la disponibilité (Mobile First: pour l'app chauffeur plus tard)
  updateAvailability(id: number, available: boolean): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.ENDPOINT}/${id}/availability`, { available });
  }

  // Créer un véhicule
  create(data: FormData): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.ENDPOINT, data);
  }

  // Optionnel : Mettre à jour avec image
  update(id: number, data: FormData): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.ENDPOINT}/${id}`, data);
  }

  // Supprimer un véhicule
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ENDPOINT}/${id}`);
  }
}