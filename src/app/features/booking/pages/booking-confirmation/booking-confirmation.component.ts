import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../../core/services/booking/booking.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.scss',
})
export class BookingConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);

  booking = signal<any>(null); // Détails de la réservation
  isProcessing = signal(false);

  ngOnInit() {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.loadBookingDetails(+bookingId);
    }
  }

  loadBookingDetails(id: number) {
    // On récupère les infos (Trajet, Sièges, Prix total)
    this.bookingService.getBookingById(id).subscribe((data) => {
      this.booking.set(data);
    });
  }

  confirmAndPay() {
    this.isProcessing.set(true);
    const id = this.booking().id;

    // Appel au endpoint PATCH /v1/bookings/{id}/confirm
    this.bookingService.confirmPayment(id).subscribe({
      next: () => {
        // Une fois payé, on redirige vers l'affichage des tickets
        this.router.navigate(['/tickets/my-tickets']);
      },
      error: (err) => {
        console.error('Erreur paiement', err);
        this.isProcessing.set(false);
      },
    });
  }
}
