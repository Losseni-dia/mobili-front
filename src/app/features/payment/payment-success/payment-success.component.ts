import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

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
        console.log('Vérification status:', data.status);

        if (data.status === 'PENDING') {
          setTimeout(() => this.loadBookingDetails(), 2000);
        } else {
          this.loading = false;
          this.cdr.detectChanges(); // <--- Force Angular à voir que loading est false
          console.log('Loading est maintenant :', this.loading);
        }
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
