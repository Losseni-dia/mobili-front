import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router'; // 👈 Import de Router et RouterModule
import { debounceTime } from 'rxjs/operators';

// Services
import { TripService, Trip } from '../../../core/services/trip/trip.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  // ✅ Ajout de RouterModule ici pour que [routerLink] fonctionne dans le HTML
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Injections
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private tripService = inject(TripService);
  private authService = inject(AuthService);
  private router = inject(Router); // 👈 Injecter le Router pour la navigation programmée

  // Data
  allTrips: Trip[] = [];
  filteredTrips: Trip[] = [];

  // Configuration
  readonly IMAGE_BASE_URL = 'http://localhost:8080/uploads/';

  // Formulaire de recherche
  searchForm = this.fb.group({
    departure: [''],
    arrival: [''],
    date: [''],
  });

  ngOnInit() {
    this.searchForm.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.applyFilter();
    });

    this.tripService.getAllTrips().subscribe({
      next: (data) => {
        this.allTrips = data;
        this.applyFilter();
      },
      error: (err) => console.error('Erreur API:', err),
    });
  }

  /**
   * Redirection vers la page de réservation avec plan de bus
   */
  openBooking(trip: Trip) {
    // Vérifier si l'utilisateur est connecté avant de naviguer (Optionnel car gardé par AuthGuard)
    if (!this.authService.currentUser()) {
      // On peut rediriger vers le login ou laisser le AuthGuard faire son travail
      this.router.navigate(['/auth/login']);
      return;
    }
    // Navigation vers la nouvelle feature booking
    this.router.navigate(['/booking/trip', trip.id]);
  }

  formatVehicleType(type: string | undefined): string {
    if (!type) return '';
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

  resetFilter() {
    this.searchForm.reset();
    this.applyFilter();
  }
}
