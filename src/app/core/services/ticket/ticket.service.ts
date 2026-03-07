import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);

  // On utilise le même préfixe que tes autres services
  private readonly API_URL = '/tickets';

  /**
   * Récupère tous les tickets d'un utilisateur
   */
  getTicketsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/user/${userId}`).pipe(
      catchError((error) => {
        console.error('Erreur tickets:', error);
        return of([]); // Renvoie une liste vide en cas d'erreur pour éviter de faire planter l'UI
      }),
    );
  }

  /**
   * Récupère les détails d'un ticket spécifique
   */
  getTicketById(ticketId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${ticketId}`);
  }

  /**
   * Annuler un ticket
   */
  cancelTicket(ticketId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${ticketId}`);
  }

  verifyTicket(ticketNumber: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/verify/${ticketNumber}`, {});
  }
}
