import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trip {
  id: number;
  departureCity: string;
  arrivalCity: string;
  boardingPoint: string; // Vérifie bien ce nom
  departureDateTime: string; // Ou Date
  price: number;
  availableSeats: number;
  vehicleType: string;
  vehicleImageUrl?: string; // Optionnel car peut être null
  moreInfo?: string; // Optionnel (villes étapes)
  status?: string;
  partnerName?: string;
}

@Injectable({ providedIn: 'root' })
export class TripService {
  private http = inject(HttpClient);

  createTrip(formData: FormData): Observable<Trip> {
    // On envoie le formData directement sans préciser de headers
    return this.http.post<Trip>('/trips', formData);
  }
  // Pour charger tous les voyages par défaut sur la Home
  getAllTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>('/trips');
  }

  // Pour une recherche spécifique via l'API si besoin
  searchTrips(from: string, to: string, date: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(`/trips/search?from=${from}&to=${to}&date=${date}`);
  }

  /**
   * Supprime un trajet par son ID
   */
  deleteTrip(id: number): Observable<void> {
    // Utilisation directe de la chaîne pour être raccord avec tes autres méthodes
    return this.http.delete<void>(`/trips/${id}`);
  }
}
