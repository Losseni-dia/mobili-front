import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour *ngIf et *ngFor
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Pour routerLink
import { BookingService } from '../../../core/services/booking/booking.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule], // <--- AJOUTE ÇA ICI
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss'],
})
export class PaymentSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);

  bookingId: number | null = null;
  loading = true;
  bookingDetails: any = null;

  ngOnInit(): void {
    // Récupération sécurisée des paramètres
    this.route.queryParams.subscribe((params) => {
      const idParam = params['id'];
      const status = params['status'];

      if (idParam && status === 'approved') {
        // CORRECTION : Si FedaPay envoie deux IDs, on prend le premier (ton bookingId)
        const id = Array.isArray(idParam) ? idParam[0] : idParam;
        this.bookingId = parseInt(id, 10);
        this.loadBookingDetails();
      } else {
        // Si pas de paiement approuvé, on redirige vers l'accueil
        this.router.navigate(['/']);
      }
    });
  }

  loadBookingDetails() {
    if (!this.bookingId) return;

    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (data) => {
        this.bookingDetails = data;

        // POLLING : Si le Webhook n'a pas encore validé, on attend 2s
        if (data.status === 'PENDING') {
          setTimeout(() => this.loadBookingDetails(), 2000);
        } else {
          this.loading = false; // Affiche enfin la carte de succès
        }
      },
      error: (err) => {
        console.error('Erreur chargement réservation', err);
        this.loading = false;
      },
    });
  }
}
