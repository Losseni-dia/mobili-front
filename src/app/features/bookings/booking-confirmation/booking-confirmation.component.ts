import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking/booking.service';

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

    this.bookingService.confirmPayment(id).subscribe({
      next: () => {
        // ✅ On redirige vers /booking/my-tickets (Route cohérente avec tes nouveaux dossiers)
        this.router.navigate(['/booking/my-tickets']);
      },
      error: (err) => {
        console.error('Erreur paiement', err);
        this.isProcessing.set(false);
        // Tu pourrais ici afficher un petit message d'erreur si le solde est insuffisant
      },
    });
  }
}
