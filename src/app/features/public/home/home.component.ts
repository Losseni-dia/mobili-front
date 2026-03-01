import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime } from 'rxjs/operators';

// Services
import { TripService, Trip } from '../../../core/services/trip/trip.service';
import { BookingService } from '../../../core/services/booking/booking.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Injections
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private tripService = inject(TripService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  // Data
  allTrips: Trip[] = [];
  filteredTrips: Trip[] = [];
  passengerNames: string[] = [''];
  selectedTrip: Trip | null = null;
  bookingSeats: number = 1;

  // Configuration
  readonly IMAGE_BASE_URL = 'http://localhost:8080/uploads/';

  // Formulaire de recherche
  searchForm = this.fb.group({
    departure: [''],
    arrival: [''],
    date: [''],
  });

  ngOnInit() {
    // Écoute les changements du formulaire pour filtrer en temps réel
    this.searchForm.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.applyFilter();
    });

    // Chargement initial des trajets
    this.tripService.getAllTrips().subscribe({
      next: (data) => {
        this.allTrips = data;
        this.applyFilter();
      },
      error: (err) => console.error('Erreur API:', err),
    });
  }

  applyFilter() {
    const formValue = this.searchForm.getRawValue();
    const searchDep = formValue.departure?.trim().toLowerCase() || '';
    const searchArr = formValue.arrival?.trim().toLowerCase() || '';
    const searchDate = formValue.date || '';

    this.filteredTrips = this.allTrips.filter((trip) => {
      const tripDep = trip.departureCity?.toLowerCase() || '';
      const tripArr = trip.arrivalCity?.toLowerCase() || '';
      const tripDate = String(trip.departureDateTime || '');

      const matchDep = !searchDep || tripDep.startsWith(searchDep);
      const matchArr = !searchArr || tripArr.startsWith(searchArr);
      const matchDate = !searchDate || tripDate.startsWith(searchDate);

      return matchDep && matchArr && matchDate;
    });

    this.cdr.detectChanges();
  }

  // --- GESTION DE LA RÉSERVATION ---

  openBooking(trip: Trip) {
    this.selectedTrip = trip;
    this.bookingSeats = 1;
    this.passengerNames = [''];
  }

  closeBooking() {
    this.selectedTrip = null;
  }

  onSeatsChange() {
    const currentLength = this.passengerNames.length;
    if (this.bookingSeats > currentLength) {
      for (let i = 0; i < this.bookingSeats - currentLength; i++) {
        this.passengerNames.push('');
      }
    } else {
      this.passengerNames = this.passengerNames.slice(0, this.bookingSeats);
    }
  }

  confirmBooking() {
    if (!this.selectedTrip) return;

    // Récupération de l'utilisateur via le Signal de l'AuthService
    const user = this.authService.currentUser();

    if (!user) {
      alert('Veuillez vous connecter pour effectuer une réservation.');
      return;
    }

    // Validation : tous les noms de passagers doivent être remplis
    if (this.passengerNames.some((name) => !name.trim())) {
      alert('Veuillez saisir le nom de tous les passagers.');
      return;
    }

    // Construction du payload avec les noms de champs attendus par le Backend
    const payload = {
      tripId: this.selectedTrip.id,
      userId: user.id, // Correction ici : utilise 'id' de AuthResponse
      numberOfSeats: this.bookingSeats,
      passengerNames: this.passengerNames,
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (res) => {
        // Notification de succès avec la référence de réservation
        alert(`Réservation réussie ! Référence : ${res.reference}`);

        // Fermeture de la modale/fenêtre de réservation
        this.closeBooking();

        // Mise à jour locale immédiate des places disponibles
        if (this.selectedTrip) {
          this.selectedTrip.availableSeats -= this.bookingSeats;
        }

        // Forcer la détection de changements pour mettre à jour la vue
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Gestion d'erreur propre via le retour API
        alert(err.error?.message || 'Erreur lors de la réservation');
      },
    });
  }

  resetFilter() {
    this.searchForm.reset();
    this.applyFilter();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
