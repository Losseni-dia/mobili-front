import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip } from '../model/trip.model';

@Injectable({ providedIn: 'root' })
export class TripService {
  private http = inject(HttpClient);

  search(from: string, to: string): Observable<Trip[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    // L'intercepteur ajoutera l'URL de base devant '/trips'
    return this.http.get<Trip[]>('/trips', { params });
  }
}