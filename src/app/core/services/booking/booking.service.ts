import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface pour typer tes données de réservation
export interface BookingRequest {
  tripId: number;
  userId: number;
  passengerNames: string[];
  numberOfSeats: number;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  /**
   * Créer une nouvelle réservation (Statut PENDING par défaut)
   * @param bookingData Données incluant le trajet, l'utilisateur et les passagers
   */
  createBooking(bookingData: BookingRequest): Observable<any> {
    return this.http.post('/bookings', bookingData);
  }

  /**
   * Confirmer le paiement d'une réservation (Passe à CONFIRMED)
   * @param bookingId L'identifiant de la réservation
   */
  confirmPayment(bookingId: number): Observable<void> {
    return this.http.patch<void>(`/bookings/${bookingId}/confirm`, {});
  }

  /**
   * Récupérer l'historique des réservations d'un utilisateur spécifique
   * @param userId L'identifiant du client
   */
  getUserBookings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`/bookings/user/${userId}`);
  }
}
