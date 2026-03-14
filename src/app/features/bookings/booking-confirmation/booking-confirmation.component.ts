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
    const rawId = this.booking().id;

    // FORCE la conversion en nombre simple pour éviter d'envoyer "27,414088"
    const cleanId = Number(Array.isArray(rawId) ? rawId[0] : rawId);

    if (isNaN(cleanId)) {
      alert("Erreur d'identification de la réservation.");
      return;
    }

    this.isProcessing.set(true);

    this.bookingService.getFedaPayUrl(cleanId).subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (err) => {
        this.isProcessing.set(false);
        alert('Erreur technique. Veuillez réessayer.');
      },
    });
  }
}
