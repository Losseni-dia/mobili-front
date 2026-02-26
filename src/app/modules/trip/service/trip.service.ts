import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../model/trip.model';

@Injectable({ providedIn: 'root' })
export class TripService {
  private http = inject(HttpClient);

  // MÉTHODE 1 : Récupération globale (Appelée au chargement / ngOnInit)
  // Correspond au @GetMapping dans ton Controller
  findAll(): Observable<Trip[]> {
    return this.http.get<Trip[]>('/trips');
  }

  // MÉTHODE 2 : Recherche filtrée (Appelée au clic sur le bouton)
  // Correspond au @GetMapping("/search") dans ton Controller
  search(departure: string, arrival: string, date?: string): Observable<Trip[]> {
    let params = new HttpParams()
      .set('departure', departure)
      .set('arrival', arrival);

    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<Trip[]>('/trips/search', { params });
  }
}