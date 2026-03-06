import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SeatSelection {
  passengerName: string;
  seatNumber: string;
}

export interface BookingRequest {
  tripId: number;
  userId: number;
  numberOfSeats: number;
  selections: SeatSelection[]; // On remplace les deux tableaux par celui-ci
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private readonly API_URL = '/bookings';

  /**
   * ✅ Récupère les sièges occupés.
   * Si l'API échoue, on renvoie [] pour que le bus s'affiche quand même.
   */
  getOccupiedSeats(tripId: number): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.API_URL}/trips/${tripId}/occupied-seats`)
      .pipe(catchError(() => of([])));
  }

  /**
   * Enregistre la réservation et les sièges choisis
   */
  createBooking(bookingData: BookingRequest): Observable<any> {
    return this.http.post(this.API_URL, bookingData);
  }

  confirmPayment(bookingId: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${bookingId}/confirm`, {});
  }

  getUserBookings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/user/${userId}`);
  }

  getBookingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }
}
